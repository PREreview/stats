import { HttpClient, HttpClientRequest, HttpClientResponse, Terminal } from '@effect/platform'
import { NodeHttpClient, NodeTerminal } from '@effect/platform-node'
import { Config, Effect, pipe, Redacted, Schema } from 'effect'
import * as Doi from '../lib/Doi.js'
import * as LanguageCode from '../lib/LanguageCode.js'
import { DomainIdSchema, FieldIdSchema, SubfieldIdSchema } from '../lib/OpenAlex.js'
import * as PreprintServer from '../lib/PreprintServer.js'
import * as Temporal from '../lib/Temporal.js'

const Requests = Schema.Chunk(
  Schema.Struct({
    timestamp: Temporal.InstantFromStringSchema,
    preprint: Doi.ParseDoiSchema,
    server: Schema.Union(PreprintServer.PreprintServerSchema, Schema.Literal('unable to determine server')),
    language: Schema.OptionFromNullOr(LanguageCode.LanguageCodeSchema),
    fields: Schema.Array(FieldIdSchema),
    subfields: Schema.Array(SubfieldIdSchema),
    domains: Schema.Array(DomainIdSchema),
  }),
)

const program = Effect.gen(function* () {
  const terminal = yield* Terminal.Terminal

  const token = yield* Config.redacted('PREREVIEW_REVIEWS_DATA_TOKEN')

  const request = HttpClientRequest.bearerToken(
    HttpClientRequest.get('https://prereview.org/requests-data'),
    Redacted.value(token),
  )

  const data = yield* pipe(
    HttpClient.execute(request),
    Effect.andThen(HttpClientResponse.filterStatusOk),
    Effect.andThen(HttpClientResponse.schemaBodyJson(Requests)),
    Effect.scoped,
  )

  const encoded = yield* Schema.encode(Schema.parseJson(Requests))(data)

  yield* terminal.display(encoded)
})

await Effect.runPromise(program.pipe(Effect.provide(NodeHttpClient.layer), Effect.provide(NodeTerminal.layer)))
