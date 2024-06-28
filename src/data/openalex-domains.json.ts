import { HttpClient, Terminal } from '@effect/platform'
import { NodeTerminal } from '@effect/platform-node'
import { Schema } from '@effect/schema'
import { Effect, Record } from 'effect'
import { DomainIdFromUrlSchema, DomainIdSchema } from '../lib/OpenAlex.js'
import { UrlFromStringSchema } from '../lib/Url.js'

const Domains = Schema.Struct({
  results: Schema.Array(
    Schema.Struct({
      id: Schema.compose(UrlFromStringSchema, DomainIdFromUrlSchema),
      display_name: Schema.String,
    }),
  ),
})

const DomainNames = Schema.Record(DomainIdSchema, Schema.String)

const program = Effect.gen(function* () {
  const terminal = yield* Terminal.Terminal

  const request = HttpClient.request.get('https://api.openalex.org/domains?per-page=200')

  const data = yield* HttpClient.client
    .fetchOk(request)
    .pipe(Effect.andThen(HttpClient.response.schemaBodyJson(Domains)), Effect.scoped)

  const transformedData = Record.fromIterableWith(data.results, domain => [domain.id, domain.display_name])

  const encoded = yield* Schema.encode(Schema.parseJson(DomainNames))(transformedData)

  yield* terminal.display(encoded)
})

await Effect.runPromise(program.pipe(Effect.provide(NodeTerminal.layer)))
