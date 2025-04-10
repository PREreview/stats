import { HttpClient, HttpClientRequest, HttpClientResponse, Terminal } from '@effect/platform'
import { NodeHttpClient, NodeTerminal } from '@effect/platform-node'
import { Array, Config, Effect, Redacted, Schema } from 'effect'
import * as Temporal from '../lib/Temporal.js'
import * as Url from '../lib/Url.js'

const Visitors = Schema.Array(
  Schema.Struct({
    visits: Schema.NumberFromString,
    date: Temporal.PlainYearMonthFromStringSchema,
    referrer_hostname: Schema.OptionFromNullOr(Url.UrlFromStringSchema),
  }),
)

const Output = Schema.Array(
  Schema.Struct({
    number: Schema.NumberFromString,
    yearMonth: Temporal.PlainYearMonthFromStringSchema,
    referrer: Schema.OptionFromNullOr(Url.UrlFromStringSchema),
  }),
)

const program = Effect.gen(function* () {
  const client = yield* HttpClient.HttpClient
  const terminal = yield* Terminal.Terminal
  const sandbox = yield* Config.withDefault(Config.boolean('SANDBOX'), false)

  if (sandbox) {
    return yield* terminal.display('[]')
  }

  const token = yield* Config.redacted('FATHOM_TOKEN')

  const request = HttpClientRequest.bearerToken(
    HttpClientRequest.get('https://api.usefathom.com/v1/aggregations', {
      urlParams: {
        entity: 'pageview',
        entity_id: 'FEAJEBBA',
        aggregates: 'visits',
        date_grouping: 'month',
        field_grouping: 'referrer_hostname',
      },
    }),
    Redacted.value(token),
  )

  const data = yield* client
    .execute(request)
    .pipe(
      Effect.andThen(HttpClientResponse.filterStatusOk),
      Effect.andThen(HttpClientResponse.schemaBodyJson(Visitors)),
      Effect.scoped,
    )

  const transformedData = Array.map(
    Array.filter(data, visitors => visitors.visits > 0),
    visitors => ({
      number: visitors.visits,
      yearMonth: visitors.date,
      referrer: visitors.referrer_hostname,
    }),
  )

  const encoded = yield* Schema.encode(Schema.parseJson(Output))(transformedData)

  yield* terminal.display(encoded)
})

await Effect.runPromise(program.pipe(Effect.provide(NodeHttpClient.layer), Effect.provide(NodeTerminal.layer)))
