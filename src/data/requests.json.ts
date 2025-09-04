import { HttpClient, HttpClientResponse, Terminal } from '@effect/platform'
import { NodeHttpClient, NodeTerminal } from '@effect/platform-node'
import { Effect, Option, pipe, Schema, Stream } from 'effect'
import * as Doi from '../lib/Doi.js'
import * as LanguageCode from '../lib/LanguageCode.js'
import { DomainIdSchema, FieldIdSchema, SubfieldIdSchema } from '../lib/OpenAlex.js'
import * as PreprintServer from '../lib/PreprintServer.js'
import * as Temporal from '../lib/Temporal.js'

const Requests = Schema.Chunk(
  Schema.Struct({
    timestamp: Temporal.InstantFromStringSchema,
    preprint: Doi.DoiSchema,
    server: Schema.OptionFromNullishOr(PreprintServer.PreprintServerSchema, undefined),
    language: Schema.OptionFromNullishOr(LanguageCode.LanguageCodeSchema, undefined),
    fields: Schema.Array(FieldIdSchema),
    subfields: Schema.Array(SubfieldIdSchema),
    domains: Schema.Array(DomainIdSchema),
  }),
)

const program = Effect.gen(function* () {
  const terminal = yield* Terminal.Terminal

  const data = yield* Stream.paginateChunkEffect(1, page =>
    pipe(
      HttpClient.get('https://coar-notify.prereview.org/requests', { urlParams: { page } }),
      Effect.andThen(HttpClientResponse.filterStatusOk),
      Effect.andThen(HttpClientResponse.schemaBodyJson(Requests)),
      Effect.scoped,
      Effect.andThen(results => [results, Option.andThen(Option.fromIterable(results), page + 1)]),
    ),
  ).pipe(Stream.runCollect)

  const encoded = yield* Schema.encode(Schema.parseJson(Requests))(data)

  yield* terminal.display(encoded)
})

await Effect.runPromise(program.pipe(Effect.provide(NodeHttpClient.layer), Effect.provide(NodeTerminal.layer)))
