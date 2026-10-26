import { Terminal } from '@effect/platform'
import { NodeFileSystem, NodeHttpClient, NodeTerminal } from '@effect/platform-node'
import { Config, Effect, Layer, Schema } from 'effect'

const NodeLayer = Layer.mergeAll(NodeFileSystem.layer, NodeHttpClient.layer, NodeTerminal.layer)

export const runLoader = <A, E>(program: Effect.Effect<A, E, Layer.Layer.Success<typeof NodeLayer>>): Promise<A> =>
  Effect.runPromise(Effect.provide(program, NodeLayer))

export const display = <A, I, R>(schema: Schema.Schema<A, I, R>, data: A) =>
  Effect.gen(function* () {
    const terminal = yield* Terminal.Terminal

    const encoded = yield* Schema.encode(Schema.parseJson(schema))(data)

    yield* terminal.display(encoded)
  })

export const unlessSandbox = <A, E, R>(program: Effect.Effect<A, E, R>, sandboxOutput: string) =>
  Effect.gen(function* () {
    const sandbox = yield* Config.withDefault(Config.boolean('SANDBOX'), false)

    if (sandbox) {
      const terminal = yield* Terminal.Terminal

      return yield* terminal.display(sandboxOutput)
    }

    return yield* program
  })
