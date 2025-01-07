import { HttpClient, HttpClientRequest, HttpClientResponse, Terminal } from '@effect/platform'
import { NodeHttpClient, NodeTerminal } from '@effect/platform-node'
import { Effect, Record, Schema } from 'effect'
import { FieldIdFromUrlSchema, FieldIdSchema, SubfieldIdFromUrlSchema, SubfieldIdSchema } from '../lib/OpenAlex.js'
import { UrlFromStringSchema } from '../lib/Url.js'

const Subfields = Schema.Struct({
  results: Schema.Array(
    Schema.Struct({
      id: Schema.compose(UrlFromStringSchema, SubfieldIdFromUrlSchema),
      display_name: Schema.String,
      field: Schema.Struct({
        id: Schema.compose(UrlFromStringSchema, FieldIdFromUrlSchema),
      }),
    }),
  ),
})

const SubfieldNames = Schema.Record({
  key: SubfieldIdSchema,
  value: Schema.Struct({ name: Schema.String, field: FieldIdSchema }),
})

const program = Effect.gen(function* () {
  const client = yield* HttpClient.HttpClient
  const terminal = yield* Terminal.Terminal

  const request1 = HttpClientRequest.get('https://api.openalex.org/subfields?per-page=200')

  const data = yield* client
    .execute(request1)
    .pipe(Effect.andThen(HttpClientResponse.schemaBodyJson(Subfields)), Effect.scoped)

  const request2 = HttpClientRequest.get('https://api.openalex.org/subfields?per-page=200&page=2')

  const data2 = yield* client
    .execute(request2)
    .pipe(Effect.andThen(HttpClientResponse.schemaBodyJson(Subfields)), Effect.scoped)

  const transformedData = Record.fromIterableWith([...data.results, ...data2.results], subfield => [
    subfield.id,
    { name: subfield.display_name, field: subfield.field.id },
  ])

  const encoded = yield* Schema.encode(Schema.parseJson(SubfieldNames))(transformedData)

  yield* terminal.display(encoded)
})

await Effect.runPromise(program.pipe(Effect.provide(NodeHttpClient.layer), Effect.provide(NodeTerminal.layer)))
