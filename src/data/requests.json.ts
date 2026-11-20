import { Config, Effect, flow, Option, pipe, Schema, Stream, String } from 'effect'
import { Headers, HttpClient, HttpClientRequest, HttpClientResponse } from 'effect/http'
import * as Doi from '../lib/Doi.js'
import * as LanguageCode from '../lib/LanguageCode.js'
import { runLoader } from '../lib/Loader.js'
import { DomainIdSchema, FieldIdSchema, SubfieldIdSchema } from '../lib/OpenAlex.js'
import * as PreprintServer from '../lib/PreprintServer.js'
import * as Temporal from '../lib/Temporal.js'

const Requests = Schema.Array(
  Schema.Struct({
    timestamp: Temporal.InstantFromStringSchema,
    preprint: Doi.ParseDoiSchema,
    server: Schema.Union([PreprintServer.PreprintServerSchema, Schema.Literal('unable to determine server')]),
    language: Schema.OptionFromNullOr(LanguageCode.LanguageCodeSchema),
    fields: Schema.Array(FieldIdSchema),
    subfields: Schema.Array(SubfieldIdSchema),
    domains: Schema.Array(DomainIdSchema),
  }),
)

const program = Effect.gen(function* () {
  const token = yield* Config.Redacted('PREREVIEW_REVIEWS_DATA_TOKEN')

  const httpClient = yield* Effect.map(
    HttpClient.HttpClient,
    flow(HttpClient.mapRequest(HttpClientRequest.bearerToken(token)), HttpClient.filterStatusOk),
  )

  const data = yield* Stream.paginate(
    new URL('https://prereview.org/requests-data'),
    Effect.fnUntraced(function* (url) {
      const response = yield* httpClient.get(url)
      const requests = yield* HttpClientResponse.schemaBodyJson(Requests)(response)

      return [requests, getNextLink(response, url)] as const
    }),
  ).pipe(Stream.runCollect)

  return data
})

const getNextLink = (response: HttpClientResponse.HttpClientResponse, base: URL): Option.Option<URL> =>
  pipe(
    Headers.get(response.headers, 'link'),
    Option.flatMap(String.match(/<([^>]*)>\s*;\s*rel="?next"?/)),
    Option.flatMap(([, href]) => Option.fromNullishOr(href)),
    Option.map(href => new URL(href, base)),
  )

await runLoader(program, Requests)
