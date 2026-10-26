import { Array, Config, Effect, Option, Redacted, Schema } from 'effect'
import { HttpClient, HttpClientRequest, HttpClientResponse } from 'effect/http'
import * as Iso3166 from '../../lib/Iso3166.js'
import { runLoader, unlessSandbox } from '../../lib/Loader.js'
import * as OrcidId from '../../lib/OrcidId.js'
import * as Temporal from '../../lib/Temporal.js'

const Users = Schema.Array(
  Schema.Struct({
    orcid: OrcidId.OrcidIdSchema,
    careerStage: Schema.OptionFromOptional(Schema.Literals(['early', 'mid', 'late'])),
    requestNotifications: Schema.Literals(['not-opted-in', 'opted-in', 'opted-out']),
    orcidRecordConnected: Schema.Boolean,
    location: Schema.OptionFromOptional(Schema.String),
    timestamp: Schema.Union([Temporal.InstantFromStringSchema, Schema.Literal('not available from import source')]),
  }),
)

const Output = Schema.Array(
  Schema.Struct({
    orcid: OrcidId.OrcidIdSchema,
    careerStage: Schema.OptionFromOptional(Schema.Literals(['early', 'mid', 'late'])),
    requestNotifications: Schema.Literals(['not-opted-in', 'opted-in', 'opted-out']),
    orcidRecordConnected: Schema.Boolean,
    location: Schema.OptionFromOptional(Schema.String),
    country: Schema.OptionFromOptional(Iso3166.Alpha2CodeSchema),
    timestamp: Schema.OptionFromOptional(Temporal.InstantFromStringSchema),
  }),
)

const program = Effect.gen(function* () {
  const client = yield* HttpClient.HttpClient

  const token = yield* Config.Redacted('PREREVIEW_REVIEWS_DATA_TOKEN')

  const request = HttpClientRequest.bearerToken(
    HttpClientRequest.get('https://prereview.org/users-data'),
    Redacted.value(token),
  )

  const data = yield* client
    .execute(request)
    .pipe(Effect.andThen(HttpClientResponse.filterStatusOk), Effect.andThen(HttpClientResponse.schemaBodyJson(Users)))

  const transformedData = Array.map(data, user => ({
    ...user,
    country: Option.flatMap(user.location, Iso3166.guessCountry),
    timestamp: Option.liftPredicate(user.timestamp, timestamp => timestamp !== 'not available from import source'),
  }))

  return transformedData
})

await runLoader(unlessSandbox(program, []), Output)
