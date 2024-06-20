import { ParseResult, Schema } from '@effect/schema'
import { Temporal } from '@js-temporal/polyfill'

export const { Instant } = Temporal

export type Instant = Temporal.Instant

export const InstantFromSelfSchema = Schema.instanceOf(Temporal.Instant)

export const InstantFromStringSchema: Schema.Schema<Instant, string> = Schema.transformOrFail(
  Schema.String,
  InstantFromSelfSchema,
  {
    decode: (date, _, ast) =>
      ParseResult.try({
        try: () => Instant.from(date),
        catch: () => new ParseResult.Type(ast, date),
      }),
    encode: instant => ParseResult.succeed(instant.toString()),
  },
)
