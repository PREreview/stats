import { Temporal } from '@js-temporal/polyfill'
import { ParseResult, Schema } from 'effect'

export const { Instant, PlainDate, PlainYearMonth } = Temporal

export type Instant = Temporal.Instant
export type PlainDate = Temporal.PlainDate
export type PlainYearMonth = Temporal.PlainYearMonth

export const InstantFromSelfSchema = Schema.instanceOf(Temporal.Instant)

export const PlainDateFromSelfSchema = Schema.instanceOf(PlainDate)

export const PlainYearMonthFromSelfSchema = Schema.instanceOf(PlainYearMonth)

export const InstantFromStringSchema: Schema.Schema<Instant, string> = Schema.transformOrFail(
  Schema.String,
  InstantFromSelfSchema,
  {
    decode: (date, _, ast) =>
      ParseResult.try({
        try: () => Instant.from(date),
        catch: () => new ParseResult.Type(ast, date),
      }),
    encode: instant => ParseResult.succeed(instant.toString({ fractionalSecondDigits: 3 })),
  },
)

export const PlainDateFromStringSchema: Schema.Schema<PlainDate, string> = Schema.transformOrFail(
  Schema.String,
  PlainDateFromSelfSchema,
  {
    decode: (date, _, ast) =>
      ParseResult.try({
        try: () => PlainDate.from(date, { overflow: 'reject' }),
        catch: () => new ParseResult.Type(ast, date),
      }),
    encode: plainDate => ParseResult.succeed(plainDate.toString()),
  },
)

export const PlainYearMonthFromStringSchema: Schema.Schema<PlainYearMonth, string> = Schema.transformOrFail(
  Schema.String,
  PlainYearMonthFromSelfSchema,
  {
    decode: (yearMonth, _, ast) =>
      ParseResult.try({
        try: () => PlainYearMonth.from(yearMonth, { overflow: 'reject' }),
        catch: () => new ParseResult.Type(ast, yearMonth),
      }),
    encode: plainYearMonth => ParseResult.succeed(plainYearMonth.toString()),
  },
)
