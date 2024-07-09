import { HttpClient, HttpClientRequest, HttpClientResponse, Terminal } from '@effect/platform'
import { NodeTerminal } from '@effect/platform-node'
import { Schema } from '@effect/schema'
import { Array, Config, Effect, Option, Redacted } from 'effect'
import * as Iso3166 from '../lib/Iso3166.js'
import * as Temporal from '../lib/Temporal.js'

const Users = Schema.Array(
  Schema.Struct({
    careerStage: Schema.OptionFromUndefinedOr(Schema.Literal('early', 'mid', 'late')),
    location: Schema.OptionFromUndefinedOr(Schema.String),
    timestamp: Temporal.InstantFromStringSchema,
  }),
)

const Output = Schema.Array(
  Schema.Struct({
    careerStage: Schema.OptionFromUndefinedOr(Schema.Literal('early', 'mid', 'late')),
    location: Schema.OptionFromUndefinedOr(Schema.String),
    country: Schema.OptionFromUndefinedOr(Iso3166.Alpha2CodeSchema),
    timestamp: Temporal.InstantFromStringSchema,
  }),
)

const program = Effect.gen(function* () {
  const terminal = yield* Terminal.Terminal
  const token = yield* Config.redacted('PREREVIEW_REVIEWS_DATA_TOKEN')

  const request = HttpClientRequest.bearerToken(
    HttpClientRequest.get('https://prereview.org/users-data'),
    Redacted.value(token),
  )

  const data = yield* HttpClient.fetchOk(request).pipe(
    Effect.andThen(HttpClientResponse.schemaBodyJson(Users)),
    Effect.scoped,
  )

  const transformedData = Array.map(data, user => ({
    ...user,
    country: Option.flatMap(user.location, Iso3166.guessCountry),
  }))

  const encoded = yield* Schema.encode(Schema.parseJson(Output))(transformedData)

  yield* terminal.display(encoded)
})

await Effect.runPromise(program.pipe(Effect.provide(NodeTerminal.layer)))
