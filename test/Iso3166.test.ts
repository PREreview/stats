import { Option } from 'effect'
import { describe, expect, test } from 'vitest'
import * as _ from '../src/lib/Iso3166.js'

describe('guessCountry', () => {
  test.for([
    ['Algiers ( Algeria)', 'DZ'],
    ['Baylor College of Medicine, Houston, Texas', 'US'],
    ['Beijing University of Technology, Beijing 100124, PR China', 'CN'],
    ['Chicago, IL, USA', 'US'],
    ['Colorado - United States', 'US'],
    ['Czech Republic', 'CZ'],
    ['Czechia', 'CZ'],
    ['GHANA', 'GH'],
    ['London', 'GB'],
    ['London, Ontario', 'CA'],
    ['London, UK', 'GB'],
    ['London, United Kingdom', 'GB'],
    ['New York City and Los Angeles', 'US'],
    ['Québec', 'CA'],
    ['Rio de Janeiro, Brazil.', 'BR'],
    ['Sunnyvale, California', 'US'],
    ['UK', 'GB'],
    ['U.K.', 'GB'],
    ['United Kingdom', 'GB'],
    ['united states', 'US'],
    ['Washington, DC', 'US'],
  ])('guesses %s', ([input, expected]) => {
    const actual = _.guessCountry(input)

    expect(actual).toStrictEqual(Option.some(expected))
  })

  test.for([
    'Babol iran',
    'Düsseldorf',
    'Fayetteville GA (near Atlanta)',
    'Mars',
    'Norwich',
    'Southeast Asia',
    'The UK',
    'Yale university',
  ])("doesn't guess %s", input => {
    const actual = _.guessCountry(input)

    expect(actual).toStrictEqual(Option.none())
  })
})
