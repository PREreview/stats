import { Effect, Schema } from 'effect'
import { display, runLoader } from '../lib/Loader.js'
import * as PreprintServer from '../lib/PreprintServer.js'

const Output = Schema.Record(Schema.String, Schema.String)

const program = Effect.gen(function* () {
  yield* display(Output, PreprintServer.preprintServers)
})

await runLoader(program)
