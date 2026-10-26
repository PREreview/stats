import { Config, Effect, flow, Record, Schema, Stream } from 'effect'
import { HttpClient, HttpClientRequest, HttpClientResponse } from 'effect/http'
import { display, runLoader } from '../lib/Loader.js'
import { DomainIdFromUrlSchema, DomainIdSchema, FieldIdFromUrlSchema, FieldIdSchema } from '../lib/OpenAlex.js'

const Fields = Schema.Struct({
  meta: Schema.Struct({ next_cursor: Schema.OptionFromOptionalNullOr(Schema.String) }),
  results: Schema.Array(
    Schema.Struct({
      id: Schema.URLFromString.pipe(Schema.decodeTo(FieldIdFromUrlSchema)),
      display_name: Schema.String,
      domain: Schema.Struct({
        id: Schema.URLFromString.pipe(Schema.decodeTo(DomainIdFromUrlSchema)),
      }),
    }),
  ),
})

const FieldNames = Schema.Record(FieldIdSchema, Schema.Struct({ name: Schema.String, domain: DomainIdSchema }))

const program = Effect.gen(function* () {
  const token = yield* Config.Redacted('OPENALEX_API_KEY')

  const httpClient = yield* Effect.map(
    HttpClient.HttpClient,
    HttpClient.mapRequest(HttpClientRequest.bearerToken(token)),
  )

  const data = yield* Stream.paginate(
    '*',
    flow(
      cursor => httpClient.get('https://api.openalex.org/fields', { urlParams: { 'per-page': 100, cursor } }),
      Effect.andThen(HttpClientResponse.filterStatusOk),
      Effect.andThen(HttpClientResponse.schemaBodyJson(Fields)),
      Effect.map(response => [response.results, response.meta.next_cursor]),
    ),
  ).pipe(Stream.runCollect)

  const transformedData = Record.fromIterableWith(data, field => [
    field.id,
    { name: field.display_name, domain: field.domain.id },
  ])

  yield* display(FieldNames, transformedData)
})

await runLoader(program)
