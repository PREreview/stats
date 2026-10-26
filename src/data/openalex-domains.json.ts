import { Config, Effect, flow, Record, Schema, Stream } from 'effect'
import { HttpClient, HttpClientRequest, HttpClientResponse } from 'effect/http'
import { display, runLoader } from '../lib/Loader.js'
import { DomainIdFromUrlSchema, DomainIdSchema } from '../lib/OpenAlex.js'

const Domains = Schema.Struct({
  meta: Schema.Struct({ next_cursor: Schema.OptionFromOptionalNullOr(Schema.String) }),
  results: Schema.Array(
    Schema.Struct({
      id: Schema.URLFromString.pipe(Schema.decodeTo(DomainIdFromUrlSchema)),
      display_name: Schema.String,
    }),
  ),
})

const DomainNames = Schema.Record(DomainIdSchema, Schema.String)

const program = Effect.gen(function* () {
  const token = yield* Config.Redacted('OPENALEX_API_KEY')

  const httpClient = yield* Effect.map(
    HttpClient.HttpClient,
    HttpClient.mapRequest(HttpClientRequest.bearerToken(token)),
  )

  const data = yield* Stream.paginate(
    '*',
    flow(
      cursor => httpClient.get('https://api.openalex.org/domains', { urlParams: { 'per-page': 100, cursor } }),
      Effect.andThen(HttpClientResponse.filterStatusOk),
      Effect.andThen(HttpClientResponse.schemaBodyJson(Domains)),
      Effect.map(response => [response.results, response.meta.next_cursor]),
    ),
  ).pipe(Stream.runCollect)

  const transformedData = Record.fromIterableWith(data, domain => [domain.id, domain.display_name])

  yield* display(DomainNames, transformedData)
})

await runLoader(program)
