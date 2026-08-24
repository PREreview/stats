import { HttpClient, HttpClientRequest, HttpClientResponse, Terminal } from '@effect/platform'
import { NodeHttpClient, NodeTerminal } from '@effect/platform-node'
import { Array, Config, Effect, flow, Option, Redacted, Schema } from 'effect'
import * as Iso3166 from '../lib/Iso3166.js'
import * as Temporal from '../lib/Temporal.js'

const Visitors = Schema.Array(
  Schema.Struct({
    visits: Schema.NumberFromString,
    date: Temporal.PlainYearFromStringSchema,
    country_code: Schema.OptionFromNullOr(Schema.Union(Iso3166.Alpha2CodeSchema, Schema.Literal('un'))),
  }),
)

const Output = Schema.Array(
  Schema.Struct({
    number: Schema.NumberFromString,
    year: Temporal.PlainYearFromStringSchema,
    country: Schema.OptionFromNullOr(Iso3166.Alpha2CodeSchema),
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
            field_grouping: 'country_code',
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

  const transformedData = Array.map(data, visitors => ({
    number: visitors.visits,
    year: visitors.date,
    country: Option.filter(visitors.country_code, Iso3166.isAlpha2Code),
  }))

  const encoded = yield* Schema.encode(Schema.parseJson(Output))(transformedData)

  yield* terminal.display(encoded)
})

await Effect.runPromise(program.pipe(Effect.provide(NodeHttpClient.layer), Effect.provide(NodeTerminal.layer)))
