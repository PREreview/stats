import { HttpClient, HttpClientRequest, HttpClientResponse } from '@effect/platform'
import { Config, Effect, flow, Record, Schema, Stream } from 'effect'
import { display, runLoader } from '../lib/Loader.js'
import { DomainIdFromUrlSchema, DomainIdSchema } from '../lib/OpenAlex.js'

const Domains = Schema.Struct({
  meta: Schema.Struct({ next_cursor: Schema.optionalWith(Schema.String, { as: 'Option', nullable: true }) }),
  results: Schema.Chunk(
    Schema.Struct({
      id: Schema.compose(Schema.URL, DomainIdFromUrlSchema),
      display_name: Schema.String,
    }),
  ),
})

const DomainNames = Schema.Record({ key: DomainIdSchema, value: Schema.String })

const program = Effect.gen(function* () {
  const token = yield* Config.redacted('OPENALEX_API_KEY')

  const httpClient = yield* Effect.map(
    HttpClient.HttpClient,
    HttpClient.mapRequest(HttpClientRequest.bearerToken(token)),
  )

  const data = yield* Stream.paginateChunkEffect(
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
