import { Schema } from 'effect'
import { describe, expect, test } from 'vitest'
import * as _ from '../src/lib/Temporal.js'

describe('InstantFromStringSchema', () => {
  test.for([
    ['2024-01-02T03:04:05Z', '2024-01-02T03:04:05Z'],
    ['2024-01-02T03:04:05.678Z', '2024-01-02T03:04:05.678Z'],
    ['2024-01-02T03:04:05+01:00', '2024-01-02T02:04:05Z'],
  ])('decodes %s', ([input, expected]) => {
    const actual = Schema.decodeUnknownSync(_.InstantFromStringSchema)(input)

    expect(actual).toBeInstanceOf(_.Instant)
    expect(actual.toString()).toStrictEqual(expected)
  })

  test.for(['', 'not a date', '2024-01-02', '2024-01-02T03:04:05', 123])("doesn't decode %s", input => {
    expect(() => Schema.decodeUnknownSync(_.InstantFromStringSchema)(input)).toThrow()
  })

  test.for([
    ['2024-01-02T03:04:05Z', '2024-01-02T03:04:05.000Z'],
    ['2024-01-02T03:04:05.678912Z', '2024-01-02T03:04:05.678Z'],
  ])('encodes %s', ([input, expected]) => {
    const actual = Schema.encodeSync(_.InstantFromStringSchema)(_.Instant.from(input))

    expect(actual).toStrictEqual(expected)
  })
})

describe('PlainDateFromStringSchema', () => {
  test.for(['2024-01-02', '2024-02-29'])('decodes %s', input => {
    const actual = Schema.decodeUnknownSync(_.PlainDateFromStringSchema)(input)

    expect(actual).toBeInstanceOf(_.PlainDate)
    expect(actual.toString()).toStrictEqual(input)
  })

  test.for(['', 'not a date', '2023-02-29', '2024-13-01', '2024-01-32', 123])("doesn't decode %s", input => {
    expect(() => Schema.decodeUnknownSync(_.PlainDateFromStringSchema)(input)).toThrow()
  })

  test('encodes', () => {
    const actual = Schema.encodeSync(_.PlainDateFromStringSchema)(_.PlainDate.from('2024-01-02'))

    expect(actual).toStrictEqual('2024-01-02')
  })
})

describe('PlainYearMonthFromStringSchema', () => {
  test.for(['2024-01', '2024-12'])('decodes %s', input => {
    const actual = Schema.decodeUnknownSync(_.PlainYearMonthFromStringSchema)(input)

    expect(actual).toBeInstanceOf(_.PlainYearMonth)
    expect(actual.toString()).toStrictEqual(input)
  })

  test.for(['', 'not a date', '2024-13', '2024-00', 123])("doesn't decode %s", input => {
    expect(() => Schema.decodeUnknownSync(_.PlainYearMonthFromStringSchema)(input)).toThrow()
  })

  test('encodes', () => {
    const actual = Schema.encodeSync(_.PlainYearMonthFromStringSchema)(_.PlainYearMonth.from('2024-01'))

    expect(actual).toStrictEqual('2024-01')
  })
})

describe('PlainYearFromStringSchema', () => {
  test.for([
    ['2024', 2024],
    ['1999', 1999],
  ] as const)('decodes %s', ([input, expected]) => {
    const actual = Schema.decodeUnknownSync(_.PlainYearFromStringSchema)(input)

    expect(actual).toStrictEqual(expected)
  })

  test.for(['', 'not a year', '2024.5', 2024])("doesn't decode %s", input => {
    expect(() => Schema.decodeUnknownSync(_.PlainYearFromStringSchema)(input)).toThrow()
  })

  test('encodes', () => {
    const actual = Schema.encodeSync(_.PlainYearFromStringSchema)(2024)

    expect(actual).toStrictEqual('2024')
  })
})
