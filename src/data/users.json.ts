import { Config, Effect, Redacted, Schema } from 'effect'
import { HttpClient, HttpClientRequest, HttpClientResponse } from 'effect/http'
import { runLoader, unlessSandbox } from '../lib/Loader.js'
import * as Temporal from '../lib/Temporal.js'

const Users = Schema.Array(
  Schema.Struct({
    timestamp: Schema.Union([Temporal.InstantFromStringSchema, Schema.Literal('not available from import source')]),
  }),
)

const Output = Schema.Struct({
  count: Schema.Number.check(Schema.isInt(), Schema.isGreaterThanOrEqualTo(0)),
})

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

  return { count: data.length }
})

await runLoader(unlessSandbox(program, { count: 0 }), Output)
