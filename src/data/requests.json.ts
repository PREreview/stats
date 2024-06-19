import { HttpClient, Terminal } from '@effect/platform'
import { NodeTerminal } from '@effect/platform-node'
import { Schema } from '@effect/schema'
import { Effect } from 'effect'

const Requests = Schema.Array(Schema.Struct({}))

const program = Effect.gen(function* () {
  const terminal = yield* Terminal.Terminal

  const request = HttpClient.request.get('https://coar-notify.prereview.org/requests')

  const data = yield* HttpClient.client
    .fetchOk(request)
    .pipe(Effect.andThen(HttpClient.response.schemaBodyJson(Requests)), Effect.scoped)

  const encoded = yield* Schema.encode(Schema.parseJson(Requests))(data)

  yield* terminal.display(encoded)
})

await Effect.runPromise(program.pipe(Effect.provide(NodeTerminal.layer)))
