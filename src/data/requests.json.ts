import { Config, Effect, pipe, Redacted, Schema } from 'effect'
import { HttpClient, HttpClientRequest, HttpClientResponse } from 'effect/http'
import * as Doi from '../lib/Doi.js'
import * as LanguageCode from '../lib/LanguageCode.js'
import { display, runLoader } from '../lib/Loader.js'
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

  const request = HttpClientRequest.bearerToken(
    HttpClientRequest.get('https://prereview.org/requests-data'),
    Redacted.value(token),
  )

  const data = yield* pipe(
    HttpClient.execute(request),
    Effect.andThen(HttpClientResponse.filterStatusOk),
    Effect.andThen(HttpClientResponse.schemaBodyJson(Requests)),
  )

  yield* display(Requests, data)
})

await runLoader(program)
