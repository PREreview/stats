import { HttpClient, HttpClientRequest, HttpClientResponse, Terminal } from '@effect/platform'
import { NodeHttpClient, NodeTerminal } from '@effect/platform-node'
import { Array, Config, Effect, Option, Redacted, Schema } from 'effect'
import * as Iso3166 from '../lib/Iso3166.js'
import * as OrcidId from '../lib/OrcidId.js'
import * as Temporal from '../lib/Temporal.js'

const Users = Schema.Array(
  Schema.Struct({
    orcid: OrcidId.OrcidIdSchema,
    careerStage: Schema.OptionFromUndefinedOr(Schema.Literal('early', 'mid', 'late')),
    location: Schema.OptionFromUndefinedOr(Schema.String),
    timestamp: Temporal.InstantFromStringSchema,
  }),
)

const Output = Schema.Array(
  Schema.Struct({
    orcid: OrcidId.OrcidIdSchema,
    careerStage: Schema.OptionFromUndefinedOr(Schema.Literal('early', 'mid', 'late')),
    location: Schema.OptionFromUndefinedOr(Schema.String),
    country: Schema.OptionFromUndefinedOr(Iso3166.Alpha2CodeSchema),
    timestamp: Temporal.InstantFromStringSchema,
  }),
)

const program = Effect.gen(function* () {
  const client = yield* HttpClient.HttpClient
  const terminal = yield* Terminal.Terminal
  const sandbox = yield* Config.withDefault(Config.boolean('SANDBOX'), false)

  if (sandbox) {
    return yield* terminal.display('[]')
  }

  const token = yield* Config.redacted('PREREVIEW_REVIEWS_DATA_TOKEN')

  const request = HttpClientRequest.bearerToken(
    HttpClientRequest.get('https://prereview.org/users-data'),
    Redacted.value(token),
  )

  const data = yield* client
    .execute(request)
    .pipe(
      Effect.andThen(HttpClientResponse.filterStatusOk),
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

await Effect.runPromise(program.pipe(Effect.provide(NodeHttpClient.layer), Effect.provide(NodeTerminal.layer)))
