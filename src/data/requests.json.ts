import { HttpClient, HttpClientRequest, HttpClientResponse, Terminal } from '@effect/platform'
import { NodeTerminal } from '@effect/platform-node'
import { Schema } from '@effect/schema'
import { Effect } from 'effect'
import * as Doi from '../lib/Doi.js'
import * as LanguageCode from '../lib/LanguageCode.js'
import { DomainIdSchema, FieldIdSchema, SubfieldIdSchema } from '../lib/OpenAlex.js'
import * as PreprintServer from '../lib/PreprintServer.js'
import * as Temporal from '../lib/Temporal.js'

const Requests = Schema.Array(
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

  const request = HttpClientRequest.get('https://coar-notify.prereview.org/requests')

  const data = yield* HttpClient.fetchOk(request).pipe(
    Effect.andThen(HttpClientResponse.schemaBodyJson(Requests)),
    Effect.scoped,
  )

  const encoded = yield* Schema.encode(Schema.parseJson(Requests))(data)

  yield* terminal.display(encoded)
})

await Effect.runPromise(program.pipe(Effect.provide(NodeTerminal.layer)))
