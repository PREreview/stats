import { HttpClient, HttpClientRequest, HttpClientResponse, Terminal } from '@effect/platform'
import { NodeHttpClient, NodeTerminal } from '@effect/platform-node'
import { Config, Effect, Redacted, Schema } from 'effect'
import * as Temporal from '../lib/Temporal.js'

const Users = Schema.Array(
  Schema.Struct({
    timestamp: Schema.Union(Temporal.InstantFromStringSchema, Schema.Literal('not available from import source')),
  }),
)

const Output = Schema.Struct({
  count: Schema.NonNegativeInt,
})

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

  const encoded = yield* Schema.encode(Schema.parseJson(Output))({ count: data.length })

  yield* terminal.display(encoded)
})

await Effect.runPromise(program.pipe(Effect.provide(NodeHttpClient.layer), Effect.provide(NodeTerminal.layer)))
