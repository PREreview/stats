import { HttpClient, HttpClientRequest, HttpClientResponse, Terminal } from '@effect/platform'
import { NodeTerminal } from '@effect/platform-node'
import { Schema } from '@effect/schema'
import { Config, Effect, Record, Redacted } from 'effect'

const Clubs = Schema.Array(
  Schema.Struct({
    id: Schema.String,
    name: Schema.String,
  }),
)

const Output = Schema.Record({ key: Schema.String, value: Schema.String })

const program = Effect.gen(function* () {
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

  const data = yield* HttpClient.fetchOk(request).pipe(
    Effect.andThen(HttpClientResponse.schemaBodyJson(Clubs)),
    Effect.scoped,
  )

  const transformedData = Record.fromIterableWith(data, club => [club.id, club.name])

  const encoded = yield* Schema.encode(Schema.parseJson(Output))(transformedData)

  yield* terminal.display(encoded)
})

await Effect.runPromise(program.pipe(Effect.provide(NodeTerminal.layer)))
