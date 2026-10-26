import { Schema } from 'effect'
import { describe, expect, test } from 'vitest'
import * as _ from '../src/lib/Doi.js'

describe('DoiSchema', () => {
  test.for([
    ['10.1101/2023.01.01.123456', '10.1101/2023.01.01.123456'],
    ['10.5281/ZENODO.1234567', '10.5281/zenodo.1234567'],
    ['10.1000.10/abc', '10.1000.10/abc'],
  ])('decodes %s', ([input, expected]) => {
    const actual = Schema.decodeUnknownSync(_.DoiSchema)(input)

    expect(actual).toStrictEqual(expected)
  })

  test.for(['', 'not a doi', '10.1/abc', '10.1101/', '10.1101/.', '10.1101/..', 'doi:10.1101/abc', 123])(
    "doesn't decode %s",
    input => {
      expect(() => Schema.decodeUnknownSync(_.DoiSchema)(input)).toThrow()
    },
  )

  test('encodes', () => {
    const actual = Schema.encodeSync(_.DoiSchema)(_.Doi('10.1101/abc'))

    expect(actual).toStrictEqual('10.1101/abc')
  })
})

describe('ParseDoiSchema', () => {
  test.for([
    ['10.1101/abc', '10.1101/abc'],
    ['10.1101/ABC', '10.1101/abc'],
    ['  10.1101/abc  ', '10.1101/abc'],
    ['doi:10.1101/abc', '10.1101/abc'],
    ['https://doi.org/10.1101/abc', '10.1101/abc'],
    ['http://dx.doi.org/10.1101/abc', '10.1101/abc'],
    ['https://doi.org/10.1101/a%2Fb', '10.1101/a/b'],
  ])('decodes %s', ([input, expected]) => {
    const actual = Schema.decodeUnknownSync(_.ParseDoiSchema)(input)

    expect(actual).toStrictEqual(expected)
  })

  test.for(['', 'not a doi', 'doi:not a doi', 'https://example.com/10.1101/abc', 'ftp://doi.org/10.1101/abc', 123])(
    "doesn't decode %s",
    input => {
      expect(() => Schema.decodeUnknownSync(_.ParseDoiSchema)(input)).toThrow()
    },
  )

  test('encodes', () => {
    const actual = Schema.encodeSync(_.ParseDoiSchema)(_.Doi('10.1101/abc'))

    expect(actual).toStrictEqual('10.1101/abc')
  })
})
