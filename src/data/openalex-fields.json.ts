import { HttpClient, HttpClientResponse, Terminal } from '@effect/platform'
import { NodeHttpClient, NodeTerminal } from '@effect/platform-node'
import { Effect, flow, Record, Schema, Stream } from 'effect'
import { DomainIdFromUrlSchema, DomainIdSchema, FieldIdFromUrlSchema, FieldIdSchema } from '../lib/OpenAlex.js'
import { UrlFromStringSchema } from '../lib/Url.js'

const Fields = Schema.Struct({
  meta: Schema.Struct({ next_cursor: Schema.optionalWith(Schema.String, { as: 'Option', nullable: true }) }),
  results: Schema.Chunk(
    Schema.Struct({
      id: Schema.compose(UrlFromStringSchema, FieldIdFromUrlSchema),
      display_name: Schema.String,
      domain: Schema.Struct({
        id: Schema.compose(UrlFromStringSchema, DomainIdFromUrlSchema),
      }),
    }),
  ),
})

const FieldNames = Schema.Record({
  key: FieldIdSchema,
  value: Schema.Struct({ name: Schema.String, domain: DomainIdSchema }),
})

const program = Effect.gen(function* () {
  const terminal = yield* Terminal.Terminal

  const data = yield* Stream.paginateChunkEffect(
    '*',
    flow(
      cursor => HttpClient.get('https://api.openalex.org/fields', { urlParams: { 'per-page': 100, cursor } }),
      Effect.andThen(HttpClientResponse.filterStatusOk),
      Effect.andThen(HttpClientResponse.schemaBodyJson(Fields)),
      Effect.scoped,
      Effect.andThen(response => [response.results, response.meta.next_cursor]),
    ),
  ).pipe(Stream.runCollect)

  const transformedData = Record.fromIterableWith(data, field => [
    field.id,
    { name: field.display_name, domain: field.domain.id },
  ])

  const encoded = yield* Schema.encode(Schema.parseJson(FieldNames))(transformedData)

  yield* terminal.display(encoded)
})

await Effect.runPromise(program.pipe(Effect.provide(NodeHttpClient.layer), Effect.provide(NodeTerminal.layer)))
