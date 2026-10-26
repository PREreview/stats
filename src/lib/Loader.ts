import { NodeFileSystem, NodeHttpClient, NodeTerminal } from '@effect/platform-node'
import { Config, Effect, Layer, Schema, Terminal } from 'effect'

const NodeLayer = Layer.mergeAll(NodeFileSystem.layer, NodeHttpClient.layerNodeHttp, NodeTerminal.layer)

export const runLoader = <A, I, E>(
  program: Effect.Effect<NoInfer<A>, E, Layer.Success<typeof NodeLayer>>,
  schema: Schema.Codec<A, I, unknown>,
): Promise<void> =>
  Effect.runPromise(
    Effect.gen(function* () {
      const data = yield* program

      const terminal = yield* Terminal.Terminal

      const encoded = yield* Schema.encodeEffect(Schema.fromJsonString(schema))(data)

      yield* terminal.display(encoded)
    }).pipe(Effect.provide(NodeLayer)),
  )

export const unlessSandbox = <A, E, R>(program: Effect.Effect<A, E, R>, sandboxData: NoInfer<A>) =>
  Effect.gen(function* () {
    const sandbox = yield* Config.withDefault(Config.Boolean('SANDBOX'), false)

    if (sandbox) {
      return sandboxData
    }

    return yield* program
  })
