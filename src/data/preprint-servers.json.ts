import { Terminal } from '@effect/platform'
import { Effect, Schema } from 'effect'
import { runLoader } from '../lib/Loader.js'
import * as PreprintServer from '../lib/PreprintServer.js'

const Output = Schema.Record({ key: Schema.String, value: Schema.String })

const program = Effect.gen(function* () {
  const terminal = yield* Terminal.Terminal

  const encoded = yield* Schema.encode(Schema.parseJson(Output))(PreprintServer.preprintServers)

  yield* terminal.display(encoded)
})

await runLoader(program)
