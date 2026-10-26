import { HttpClient, HttpClientRequest, HttpClientResponse } from '@effect/platform'
import { Config, Effect, Record, Redacted, Schema } from 'effect'
import { display, runLoader, unlessSandbox } from '../lib/Loader.js'
import * as Temporal from '../lib/Temporal.js'

const Clubs = Schema.Array(
  Schema.Struct({
    id: Schema.String,
    name: Schema.String,
    added: Temporal.PlainDateFromStringSchema,
    status: Schema.Literal('active', 'inactive'),
  }),
)

const Output = Schema.Record({
  key: Schema.String,
  value: Schema.Struct({
    name: Schema.String,
    added: Temporal.PlainDateFromStringSchema,
    status: Schema.Literal('active', 'inactive'),
  }),
})

const program = Effect.gen(function* () {
  const client = yield* HttpClient.HttpClient

  const token = yield* Config.redacted('PREREVIEW_REVIEWS_DATA_TOKEN')

  const request = HttpClientRequest.bearerToken(
    HttpClientRequest.get('https://prereview.org/clubs-data'),
    Redacted.value(token),
  )

  const data = yield* client
    .execute(request)
    .pipe(Effect.andThen(HttpClientResponse.filterStatusOk), Effect.andThen(HttpClientResponse.schemaBodyJson(Clubs)))

  const transformedData = Record.fromIterableWith(data, club => [club.id, club])

  yield* display(Output, transformedData)
})

await runLoader(unlessSandbox(program, '[]'))
