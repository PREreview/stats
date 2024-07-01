import { HttpClient, Terminal } from '@effect/platform'
import { NodeTerminal } from '@effect/platform-node'
import { Schema } from '@effect/schema'
import { Config, Effect, Redacted } from 'effect'

const Reviews = Schema.Array(Schema.Struct({}))

const program = Effect.gen(function* () {
  const terminal = yield* Terminal.Terminal
  const token = yield* Config.redacted('PREREVIEW_REVIEWS_DATA_TOKEN')

  const request = HttpClient.request.bearerToken(
    HttpClient.request.get('https://prereview.org/reviews-data'),
    Redacted.value(token),
  )

  const data = yield* HttpClient.client
    .fetchOk(request)
    .pipe(Effect.andThen(HttpClient.response.schemaBodyJson(Reviews)), Effect.scoped)

  const encoded = yield* Schema.encode(Schema.parseJson(Reviews))(data)

  yield* terminal.display(encoded)
})

await Effect.runPromise(program.pipe(Effect.provide(NodeTerminal.layer)))
