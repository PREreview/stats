import { NodeFileSystem, NodeHttpClient, NodeTerminal } from '@effect/platform-node'
import { Effect, Layer } from 'effect'

const NodeLayer = Layer.mergeAll(NodeFileSystem.layer, NodeHttpClient.layer, NodeTerminal.layer)

export const runLoader = <A, E>(program: Effect.Effect<A, E, Layer.Layer.Success<typeof NodeLayer>>): Promise<A> =>
  Effect.runPromise(Effect.provide(program, NodeLayer))
