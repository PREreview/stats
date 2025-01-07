import { HttpClient, HttpClientRequest, HttpClientResponse, Terminal } from '@effect/platform'
import { NodeHttpClient, NodeTerminal } from '@effect/platform-node'
import { Effect, Record, Schema } from 'effect'
import { DomainIdFromUrlSchema, DomainIdSchema, FieldIdFromUrlSchema, FieldIdSchema } from '../lib/OpenAlex.js'
import { UrlFromStringSchema } from '../lib/Url.js'

const Fields = Schema.Struct({
  results: Schema.Array(
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
  const client = yield* HttpClient.HttpClient
  const terminal = yield* Terminal.Terminal

  const request = HttpClientRequest.get('https://api.openalex.org/fields?per-page=200')

  const data = yield* client
    .execute(request)
    .pipe(Effect.andThen(HttpClientResponse.schemaBodyJson(Fields)), Effect.scoped)

  const transformedData = Record.fromIterableWith(data.results, field => [
    field.id,
    { name: field.display_name, domain: field.domain.id },
  ])

  const encoded = yield* Schema.encode(Schema.parseJson(FieldNames))(transformedData)

  yield* terminal.display(encoded)
})

await Effect.runPromise(program.pipe(Effect.provide(NodeHttpClient.layer), Effect.provide(NodeTerminal.layer)))
