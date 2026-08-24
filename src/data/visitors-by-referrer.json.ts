import { HttpClient, HttpClientRequest, HttpClientResponse, Terminal } from '@effect/platform'
import { NodeHttpClient, NodeTerminal } from '@effect/platform-node'
import { Array, Config, Effect, flow, Redacted, Schema } from 'effect'
import * as Temporal from '../lib/Temporal.js'

const Visitors = Schema.Array(
  Schema.Struct({
    visits: Schema.NumberFromString,
    date: Temporal.PlainYearFromStringSchema,
    referrer_hostname: Schema.OptionFromNonEmptyTrimmedString,
  }),
)

const Output = Schema.Array(
  Schema.Struct({
    number: Schema.NumberFromString,
    year: Temporal.PlainYearFromStringSchema,
    referrer: Schema.OptionFromNullOr(Schema.NonEmptyTrimmedString),
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

  const currentYear = yield* Temporal.currentPlainYear

  const yearRange = Array.range(2021, currentYear)

  const data = yield* Effect.forEach(
    yearRange,
    flow(
      year =>
        HttpClientRequest.get('https://api.usefathom.com/v1/aggregations', {
          urlParams: {
            entity: 'pageview',
            entity_id: 'FEAJEBBA',
            aggregates: 'visits',
            date_grouping: 'year',
            field_grouping: 'referrer_hostname',
            limit: 1_000,
            date_from: `${year}-01-01 00:00:00`,
            date_to: `${year}-12-31 23:59:59`,
          },
        }),
      HttpClientRequest.bearerToken(Redacted.value(token)),
      client.execute,
      Effect.andThen(HttpClientResponse.filterStatusOk),
      Effect.andThen(HttpClientResponse.schemaBodyJson(Visitors)),
    ),
  ).pipe(Effect.andThen(Array.flatten))

  const transformedData = Array.map(
    Array.filter(data, visitors => visitors.visits > 0),
    visitors => ({
      number: visitors.visits,
      year: visitors.date,
      referrer: visitors.referrer_hostname,
    }),
  )

  const encoded = yield* Schema.encode(Schema.parseJson(Output))(transformedData)

  yield* terminal.display(encoded)
})

await Effect.runPromise(program.pipe(Effect.provide(NodeHttpClient.layer), Effect.provide(NodeTerminal.layer)))
