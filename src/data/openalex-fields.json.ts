import { HttpClient, Terminal } from '@effect/platform'
import { NodeTerminal } from '@effect/platform-node'
import { Schema } from '@effect/schema'
import { Array, Effect } from 'effect'
import { FieldIdFromUrlSchema, FieldIdSchema } from '../lib/OpenAlex.js'
import { UrlFromStringSchema } from '../lib/Url.js'

const Fields = Schema.Struct({
  results: Schema.Array(
    Schema.Struct({
      id: Schema.compose(UrlFromStringSchema, FieldIdFromUrlSchema),
      display_name: Schema.String,
    }),
  ),
})

const FieldNames = Schema.Record(FieldIdSchema, Schema.String)

const program = Effect.gen(function* () {
  const terminal = yield* Terminal.Terminal

  const request = HttpClient.request.get('https://api.openalex.org/fields')

  const data = yield* HttpClient.client
    .fetchOk(request)
    .pipe(Effect.andThen(HttpClient.response.schemaBodyJson(Fields)), Effect.scoped)

  const transformedData = Object.fromEntries(Array.map(data.results, field => [field.id, field.display_name]))

  const encoded = yield* Schema.encode(Schema.parseJson(FieldNames))(transformedData)

  yield* terminal.display(encoded)
})

await Effect.runPromise(program.pipe(Effect.provide(NodeTerminal.layer)))
