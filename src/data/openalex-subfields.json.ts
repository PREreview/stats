import { Config, Effect, flow, Record, Schema, Stream } from 'effect'
import { HttpClient, HttpClientRequest, HttpClientResponse } from 'effect/http'
import { display, runLoader } from '../lib/Loader.js'
import { FieldIdFromUrlSchema, FieldIdSchema, SubfieldIdFromUrlSchema, SubfieldIdSchema } from '../lib/OpenAlex.js'

const Subfields = Schema.Struct({
  meta: Schema.Struct({ next_cursor: Schema.OptionFromOptionalNullOr(Schema.String) }),
  results: Schema.Array(
    Schema.Struct({
      id: Schema.URLFromString.pipe(Schema.decodeTo(SubfieldIdFromUrlSchema)),
      display_name: Schema.String,
      field: Schema.Struct({
        id: Schema.URLFromString.pipe(Schema.decodeTo(FieldIdFromUrlSchema)),
      }),
    }),
  ),
})

const SubfieldNames = Schema.Record(SubfieldIdSchema, Schema.Struct({ name: Schema.String, field: FieldIdSchema }))

const program = Effect.gen(function* () {
  const token = yield* Config.Redacted('OPENALEX_API_KEY')

  const httpClient = yield* Effect.map(
    HttpClient.HttpClient,
    HttpClient.mapRequest(HttpClientRequest.bearerToken(token)),
  )

  const data = yield* Stream.paginate(
    '*',
    flow(
      cursor => httpClient.get('https://api.openalex.org/subfields', { urlParams: { 'per-page': 100, cursor } }),
      Effect.andThen(HttpClientResponse.filterStatusOk),
      Effect.andThen(HttpClientResponse.schemaBodyJson(Subfields)),
      Effect.map(response => [response.results, response.meta.next_cursor]),
    ),
  ).pipe(Stream.runCollect)

  const transformedData = Record.fromIterableWith(data, subfield => [
    subfield.id,
    { name: subfield.display_name, field: subfield.field.id },
  ])

  yield* display(SubfieldNames, transformedData)
})

await runLoader(program)
