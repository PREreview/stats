import { HttpClient, Terminal } from '@effect/platform'
import { NodeTerminal } from '@effect/platform-node'
import { Schema } from '@effect/schema'
import { Effect, Record } from 'effect'
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

const FieldNames = Schema.Record(FieldIdSchema, Schema.Struct({ name: Schema.String, domain: DomainIdSchema }))

const program = Effect.gen(function* () {
  const terminal = yield* Terminal.Terminal

  const request = HttpClient.request.get('https://api.openalex.org/fields?per-page=200')

  const data = yield* HttpClient.client
    .fetchOk(request)
    .pipe(Effect.andThen(HttpClient.response.schemaBodyJson(Fields)), Effect.scoped)

  const transformedData = Record.fromIterableWith(data.results, field => [
    field.id,
    { name: field.display_name, domain: field.domain.id },
  ])

  const encoded = yield* Schema.encode(Schema.parseJson(FieldNames))(transformedData)

  yield* terminal.display(encoded)
})

await Effect.runPromise(program.pipe(Effect.provide(NodeTerminal.layer)))
