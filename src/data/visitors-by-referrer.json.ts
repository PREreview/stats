import { Array, Config, Effect, flow, Option, Redacted, Schema, SchemaTransformation, String } from 'effect'
import { HttpClient, HttpClientRequest, HttpClientResponse } from 'effect/http'
import { runLoader, unlessSandbox } from '../lib/Loader.js'
import * as Temporal from '../lib/Temporal.js'

const Visitors = Schema.Array(
  Schema.Struct({
    visits: Schema.NumberFromString,
    date: Temporal.PlainYearFromStringSchema,
    referrer_hostname: Schema.String.pipe(
      Schema.decodeTo(
        Schema.Option(Schema.Trimmed.check(Schema.isNonEmpty())),
        SchemaTransformation.transform({
          decode: hostname => Option.filter(Option.some(hostname.trim()), String.isNonEmpty),
          encode: Option.getOrElse(() => ''),
        }),
      ),
    ),
  }),
)

const Output = Schema.Array(
  Schema.Struct({
    number: Schema.Int.check(Schema.isGreaterThan(0)),
    year: Temporal.PlainYearFromStringSchema,
    referrer: Schema.OptionFromNullOr(Schema.Trimmed.check(Schema.isNonEmpty())),
  }),
)

const program = Effect.gen(function* () {
  const client = yield* HttpClient.HttpClient

  const token = yield* Config.Redacted('FATHOM_TOKEN')

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
  ).pipe(Effect.map(Array.flatten))

  const transformedData = Array.map(
    Array.filter(data, visitors => visitors.visits > 0),
    visitors => ({
      number: visitors.visits,
      year: visitors.date,
      referrer: visitors.referrer_hostname,
    }),
  )

  return transformedData
})

await runLoader(unlessSandbox(program, []), Output)
