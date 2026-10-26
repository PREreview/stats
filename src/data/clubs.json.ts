import { Config, Effect, Record, Redacted, Schema } from 'effect'
import { HttpClient, HttpClientRequest, HttpClientResponse } from 'effect/http'
import { display, runLoader, unlessSandbox } from '../lib/Loader.js'
import * as Temporal from '../lib/Temporal.js'

const Clubs = Schema.Array(
  Schema.Struct({
    id: Schema.String,
    name: Schema.String,
    added: Temporal.PlainDateFromStringSchema,
    status: Schema.Literals(['active', 'inactive']),
  }),
)

const Output = Schema.Record(
  Schema.String,
  Schema.Struct({
    name: Schema.String,
    added: Temporal.PlainDateFromStringSchema,
    status: Schema.Literals(['active', 'inactive']),
  }),
)

const program = Effect.gen(function* () {
  const client = yield* HttpClient.HttpClient

  const token = yield* Config.Redacted('PREREVIEW_REVIEWS_DATA_TOKEN')

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
