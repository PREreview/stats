import { Temporal } from '@js-temporal/polyfill'
import { Clock, Effect, Number, Option, Schema, SchemaGetter, SchemaIssue, SchemaTransformation } from 'effect'

export const { Instant, PlainDate, PlainYearMonth } = Temporal

export type Instant = Temporal.Instant
export type PlainDate = Temporal.PlainDate
export type PlainYearMonth = Temporal.PlainYearMonth

export const currentInstant = Effect.map(Clock.currentTimeMillis, millis =>
  Temporal.Instant.fromEpochMilliseconds(millis),
)

export const currentPlainDate = Effect.map(currentInstant, instant => instant.toZonedDateTimeISO('UTC').toPlainDate())

export const currentPlainYear = Effect.map(
  currentInstant,
  instant => instant.toZonedDateTimeISO('UTC').toPlainDate().year,
)

export const InstantFromSelfSchema = Schema.instanceOf(Temporal.Instant)

export const PlainDateFromSelfSchema = Schema.instanceOf(PlainDate)

export const PlainYearMonthFromSelfSchema = Schema.instanceOf(PlainYearMonth)

export const InstantFromStringSchema: Schema.Codec<Instant, string> = Schema.String.pipe(
  Schema.decodeTo(
    InstantFromSelfSchema,
    SchemaTransformation.transformEffect({
      decode: (date, options) =>
        Effect.try({
          try: () => Instant.from(date),
          catch: () => new SchemaIssue.InvalidValue(undefined, date, options),
        }),
      encode: instant => Effect.succeed(instant.toString({ fractionalSecondDigits: 3 })),
    }),
  ),
)

export const PlainDateFromStringSchema: Schema.Codec<PlainDate, string> = Schema.String.pipe(
  Schema.decodeTo(
    PlainDateFromSelfSchema,
    SchemaTransformation.transformEffect({
      decode: (date, options) =>
        Effect.try({
          try: () => PlainDate.from(date, { overflow: 'reject' }),
          catch: () => new SchemaIssue.InvalidValue(undefined, date, options),
        }),
      encode: plainDate => Effect.succeed(plainDate.toString()),
    }),
  ),
)

export const PlainYearMonthFromStringSchema: Schema.Codec<PlainYearMonth, string> = Schema.String.pipe(
  Schema.decodeTo(
    PlainYearMonthFromSelfSchema,
    SchemaTransformation.transformEffect({
      decode: (yearMonth, options) =>
        Effect.try({
          try: () => PlainYearMonth.from(yearMonth, { overflow: 'reject' }),
          catch: () => new SchemaIssue.InvalidValue(undefined, yearMonth, options),
        }),
      encode: plainYearMonth => Effect.succeed(plainYearMonth.toString()),
    }),
  ),
)

export const PlainYearFromStringSchema: Schema.Codec<number, string> = Schema.String.pipe(
  Schema.decodeTo(Schema.Int, {
    decode: SchemaGetter.transformEffect(year =>
      Option.match(Number.parse(year), {
        onNone: () => Effect.fail(new SchemaIssue.InvalidValue()),
        onSome: Effect.succeed,
      }),
    ),
    encode: SchemaGetter.String(),
  }),
)
