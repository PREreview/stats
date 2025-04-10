import { HttpClient, HttpClientRequest, HttpClientResponse, Terminal } from '@effect/platform'
import { NodeHttpClient, NodeTerminal } from '@effect/platform-node'
import { Config, Effect, Record, Redacted, Schema } from 'effect'

const Clubs = Schema.Array(
  Schema.Struct({
    id: Schema.String,
    name: Schema.String,
  }),
)

const Output = Schema.Record({ key: Schema.String, value: Schema.String })

const program = Effect.gen(function* () {
  const client = yield* HttpClient.HttpClient
  const terminal = yield* Terminal.Terminal
  const sandbox = yield* Config.withDefault(Config.boolean('SANDBOX'), false)

  if (sandbox) {
    return yield* terminal.display('[]')
  }

  const token = yield* Config.redacted('PREREVIEW_REVIEWS_DATA_TOKEN')

  const request = HttpClientRequest.bearerToken(
    HttpClientRequest.get('https://prereview.org/clubs-data'),
    Redacted.value(token),
  )

  const data = yield* client
    .execute(request)
    .pipe(
      Effect.andThen(HttpClientResponse.filterStatusOk),
      Effect.andThen(HttpClientResponse.schemaBodyJson(Clubs)),
      Effect.scoped,
    )

  const transformedData = Record.fromIterableWith(data, club => [club.id, club.name])

  const encoded = yield* Schema.encode(Schema.parseJson(Output))(transformedData)

  yield* terminal.display(encoded)
})

await Effect.runPromise(program.pipe(Effect.provide(NodeHttpClient.layer), Effect.provide(NodeTerminal.layer)))
