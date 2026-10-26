import { Schema } from 'effect'
import { describe, expect, test } from 'vitest'
import * as _ from '../src/lib/OpenAlex.js'

describe('SubfieldIdFromUrlSchema', () => {
  test.for([
    ['https://openalex.org/subfields/1234', '1234'],
    ['https://openalex.org/subfields/a%2Fb', 'a/b'],
  ])('decodes %s', ([input, expected]) => {
    const actual = Schema.decodeUnknownSync(_.SubfieldIdFromUrlSchema)(new URL(input))

    expect(actual).toStrictEqual(expected)
  })

  test.for([
    'https://example.com/subfields/1234',
    'http://openalex.org/subfields/1234',
    'https://openalex.org/fields/1234',
  ])("doesn't decode %s", input => {
    expect(() => Schema.decodeUnknownSync(_.SubfieldIdFromUrlSchema)(new URL(input))).toThrow()
  })

  test("doesn't decode a string", () => {
    expect(() => Schema.decodeUnknownSync(_.SubfieldIdFromUrlSchema)('https://openalex.org/subfields/1234')).toThrow()
  })

  test.for([
    ['1234', 'https://openalex.org/subfields/1234'],
    ['a/b', 'https://openalex.org/subfields/a%2Fb'],
  ])('encodes %s', ([input, expected]) => {
    const actual = Schema.encodeSync(_.SubfieldIdFromUrlSchema)(Schema.decodeSync(_.SubfieldIdSchema)(input))

    expect(actual).toBeInstanceOf(URL)
    expect(actual.href).toStrictEqual(expected)
  })
})

describe('FieldIdFromUrlSchema', () => {
  test.for([
    ['https://openalex.org/fields/1234', '1234'],
    ['https://openalex.org/fields/a%2Fb', 'a/b'],
  ])('decodes %s', ([input, expected]) => {
    const actual = Schema.decodeUnknownSync(_.FieldIdFromUrlSchema)(new URL(input))

    expect(actual).toStrictEqual(expected)
  })

  test.for([
    'https://example.com/fields/1234',
    'http://openalex.org/fields/1234',
    'https://openalex.org/subfields/1234',
  ])("doesn't decode %s", input => {
    expect(() => Schema.decodeUnknownSync(_.FieldIdFromUrlSchema)(new URL(input))).toThrow()
  })

  test("doesn't decode a string", () => {
    expect(() => Schema.decodeUnknownSync(_.FieldIdFromUrlSchema)('https://openalex.org/fields/1234')).toThrow()
  })

  test.for([
    ['1234', 'https://openalex.org/fields/1234'],
    ['a/b', 'https://openalex.org/fields/a%2Fb'],
  ])('encodes %s', ([input, expected]) => {
    const actual = Schema.encodeSync(_.FieldIdFromUrlSchema)(Schema.decodeSync(_.FieldIdSchema)(input))

    expect(actual).toBeInstanceOf(URL)
    expect(actual.href).toStrictEqual(expected)
  })
})

describe('DomainIdFromUrlSchema', () => {
  test.for([
    ['https://openalex.org/domains/1234', '1234'],
    ['https://openalex.org/domains/a%2Fb', 'a/b'],
  ])('decodes %s', ([input, expected]) => {
    const actual = Schema.decodeUnknownSync(_.DomainIdFromUrlSchema)(new URL(input))

    expect(actual).toStrictEqual(expected)
  })

  test.for([
    'https://example.com/domains/1234',
    'http://openalex.org/domains/1234',
    'https://openalex.org/fields/1234',
  ])("doesn't decode %s", input => {
    expect(() => Schema.decodeUnknownSync(_.DomainIdFromUrlSchema)(new URL(input))).toThrow()
  })

  test("doesn't decode a string", () => {
    expect(() => Schema.decodeUnknownSync(_.DomainIdFromUrlSchema)('https://openalex.org/domains/1234')).toThrow()
  })

  test.for([
    ['1234', 'https://openalex.org/domains/1234'],
    ['a/b', 'https://openalex.org/domains/a%2Fb'],
  ])('encodes %s', ([input, expected]) => {
    const actual = Schema.encodeSync(_.DomainIdFromUrlSchema)(Schema.decodeSync(_.DomainIdSchema)(input))

    expect(actual).toBeInstanceOf(URL)
    expect(actual.href).toStrictEqual(expected)
  })
})
