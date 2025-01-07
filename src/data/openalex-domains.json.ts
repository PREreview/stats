import { HttpClient, HttpClientRequest, HttpClientResponse, Terminal } from '@effect/platform'
import { NodeHttpClient, NodeTerminal } from '@effect/platform-node'
import { Effect, Record, Schema } from 'effect'
import { DomainIdFromUrlSchema, DomainIdSchema } from '../lib/OpenAlex.js'
import { UrlFromStringSchema } from '../lib/Url.js'

const Domains = Schema.Struct({
  results: Schema.Array(
    Schema.Struct({
      id: Schema.compose(UrlFromStringSchema, DomainIdFromUrlSchema),
      display_name: Schema.String,
    }),
  ),
})

const DomainNames = Schema.Record({ key: DomainIdSchema, value: Schema.String })

const program = Effect.gen(function* () {
  const client = yield* HttpClient.HttpClient
  const terminal = yield* Terminal.Terminal

  const request = HttpClientRequest.get('https://api.openalex.org/domains?per-page=200')

  const data = yield* client
    .execute(request)
    .pipe(Effect.andThen(HttpClientResponse.schemaBodyJson(Domains)), Effect.scoped)

  const transformedData = Record.fromIterableWith(data.results, domain => [domain.id, domain.display_name])

  const encoded = yield* Schema.encode(Schema.parseJson(DomainNames))(transformedData)

  yield* terminal.display(encoded)
})

await Effect.runPromise(program.pipe(Effect.provide(NodeHttpClient.layer), Effect.provide(NodeTerminal.layer)))
