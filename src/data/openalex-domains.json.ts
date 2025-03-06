import { HttpClient, HttpClientResponse, Terminal } from '@effect/platform'
import { NodeHttpClient, NodeTerminal } from '@effect/platform-node'
import { Effect, flow, Record, Schema, Stream } from 'effect'
import { DomainIdFromUrlSchema, DomainIdSchema } from '../lib/OpenAlex.js'
import { UrlFromStringSchema } from '../lib/Url.js'

const Domains = Schema.Struct({
  meta: Schema.Struct({ next_cursor: Schema.optionalWith(Schema.String, { as: 'Option', nullable: true }) }),
  results: Schema.Chunk(
    Schema.Struct({
      id: Schema.compose(UrlFromStringSchema, DomainIdFromUrlSchema),
      display_name: Schema.String,
    }),
  ),
})

const DomainNames = Schema.Record({ key: DomainIdSchema, value: Schema.String })

const program = Effect.gen(function* () {
  const terminal = yield* Terminal.Terminal

  const data = yield* Stream.paginateChunkEffect(
    '*',
    flow(
      cursor => HttpClient.get('https://api.openalex.org/domains', { urlParams: { 'per-page': 100, cursor } }),
      Effect.andThen(HttpClientResponse.schemaBodyJson(Domains)),
      Effect.scoped,
      Effect.andThen(response => [response.results, response.meta.next_cursor]),
    ),
  ).pipe(Stream.runCollect)

  const transformedData = Record.fromIterableWith(data, domain => [domain.id, domain.display_name])

  const encoded = yield* Schema.encode(Schema.parseJson(DomainNames))(transformedData)

  yield* terminal.display(encoded)
})

await Effect.runPromise(program.pipe(Effect.provide(NodeHttpClient.layer), Effect.provide(NodeTerminal.layer)))
