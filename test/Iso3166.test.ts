import { Option, Schema } from 'effect'
import { describe, expect, test } from 'vitest'
import * as _ from '../src/lib/Iso3166.js'

describe('Alpha2CodeSchema', () => {
  test.for(['GB', 'US', 'DZ'])('decodes %s', input => {
    const actual = Schema.decodeUnknownSync(_.Alpha2CodeSchema)(input)

    expect(actual).toStrictEqual(input)
  })

  test.for(['', 'gb', 'UK', 'GBR', 'XX', 123])("doesn't decode %s", input => {
    expect(() => Schema.decodeUnknownSync(_.Alpha2CodeSchema)(input)).toThrow()
  })

  test('encodes', () => {
    const actual = Schema.encodeSync(_.Alpha2CodeSchema)('GB')

    expect(actual).toStrictEqual('GB')
  })
})

describe('guessCountry', () => {
  test.for([
    ['Algiers ( Algeria)', 'DZ'],
    ['Athens', 'GR'],
    ['Athens, GA', 'US'],
    ['Baylor College of Medicine, Houston, Texas', 'US'],
    ['Beijing University of Technology, Beijing 100124, PR China', 'CN'],
    ['Brasil', 'BR'],
    ['Chicago, IL, USA', 'US'],
    ['Colorado - United States', 'US'],
    ['Czech Republic', 'CZ'],
    ['Czechia', 'CZ'],
    ['Dallas-Fort Worth', 'US'],
    ['Düsseldorf', 'DE'],
    ['Fayetteville GA (near Atlanta)', 'US'],
    ['GHANA', 'GH'],
    ['Greater Boston, MA', 'US'],
    ['Guadalajara, España', 'ES'],
    ['London', 'GB'],
    ['London, Ontario', 'CA'],
    ['London, UK', 'GB'],
    ['London, United Kingdom', 'GB'],
    ['Nairobi-Kenya', 'KE'],
    ['New York City and Los Angeles', 'US'],
    ['Norwich', 'GB'],
    ['Québec', 'CA'],
    ['Rio de Janeiro, Brazil.', 'BR'],
    ['Sunnyvale, California', 'US'],
    ['Sydney', 'AU'],
    ['The UK', 'GB'],
    ['UK', 'GB'],
    ['U.K.', 'GB'],
    ['United Kingdom', 'GB'],
    ['united states', 'US'],
    ['Washington, DC', 'US'],
  ])('guesses %s', ([input, expected]) => {
    const actual = _.guessCountry(input)

    expect(actual).toStrictEqual(Option.some(expected))
  })

  test.for(['Babol iran', 'Mars', 'Southeast Asia', 'Yale university'])("doesn't guess %s", input => {
    const actual = _.guessCountry(input)

    expect(actual).toStrictEqual(Option.none())
  })
})
