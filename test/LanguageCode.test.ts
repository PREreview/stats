import { Schema } from 'effect'
import { describe, expect, test } from 'vitest'
import * as _ from '../src/lib/LanguageCode.js'

describe('LanguageCodeSchema', () => {
  test.for(['en', 'es', 'pt', 'zh'])('decodes %s', input => {
    const actual = Schema.decodeUnknownSync(_.LanguageCodeSchema)(input)

    expect(actual).toStrictEqual(input)
  })

  test.for(['', 'EN', 'eng', 'en-GB', 'xx', 123])("doesn't decode %s", input => {
    expect(() => Schema.decodeUnknownSync(_.LanguageCodeSchema)(input)).toThrow()
  })

  test('encodes', () => {
    const actual = Schema.encodeSync(_.LanguageCodeSchema)('en')

    expect(actual).toStrictEqual('en')
  })
})
