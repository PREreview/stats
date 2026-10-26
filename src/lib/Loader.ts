import { NodeFileSystem, NodeHttpClient, NodeTerminal } from '@effect/platform-node'
import { Config, Effect, Layer, Schema, Terminal } from 'effect'

const NodeLayer = Layer.mergeAll(NodeFileSystem.layer, NodeHttpClient.layerNodeHttp, NodeTerminal.layer)

export const runLoader = <A, E>(program: Effect.Effect<A, E, Layer.Success<typeof NodeLayer>>): Promise<A> =>
  Effect.runPromise(Effect.provide(program, NodeLayer))

export const display = <A, I, RE>(schema: Schema.Codec<A, I, unknown, RE>, data: A) =>
  Effect.gen(function* () {
    const terminal = yield* Terminal.Terminal

    const encoded = yield* Schema.encodeEffect(Schema.fromJsonString(schema))(data)

    yield* terminal.display(encoded)
  })

export const unlessSandbox = <A, E, R>(program: Effect.Effect<A, E, R>, sandboxOutput: string) =>
  Effect.gen(function* () {
    const sandbox = yield* Config.withDefault(Config.Boolean('SANDBOX'), false)

    if (sandbox) {
      const terminal = yield* Terminal.Terminal

      return yield* terminal.display(sandboxOutput)
    }

    return yield* program
  })
