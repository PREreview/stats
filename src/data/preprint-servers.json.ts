import { Effect, Schema } from 'effect'
import { runLoader } from '../lib/Loader.js'
import * as PreprintServer from '../lib/PreprintServer.js'

const Output = Schema.Record(Schema.String, Schema.String)

const program = Effect.succeed(PreprintServer.preprintServers)

await runLoader(program, Output)
