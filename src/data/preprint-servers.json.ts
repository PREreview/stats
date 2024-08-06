import { Terminal } from '@effect/platform'
import { NodeTerminal } from '@effect/platform-node'
import { Schema } from '@effect/schema'
import { Effect } from 'effect'
import * as PreprintServer from '../lib/PreprintServer.js'

const Output = Schema.Record({ key: Schema.String, value: Schema.String })

const program = Effect.gen(function* () {
  const terminal = yield* Terminal.Terminal

  const encoded = yield* Schema.encode(Schema.parseJson(Output))(PreprintServer.preprintServers)

  yield* terminal.display(encoded)
})

await Effect.runPromise(program.pipe(Effect.provide(NodeTerminal.layer)))
