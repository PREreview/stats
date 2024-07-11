import { Option } from 'effect'
import { describe, expect, test } from 'vitest'
import * as _ from '../src/lib/Iso3166.js'

describe('guessCountry', () => {
  test.for([
    ['Algiers ( Algeria)', 'DZ'],
    ['Baylor College of Medicine, Houston, Texas', 'US'],
    ['Chicago, IL, USA', 'US'],
    ['Colorado - United States', 'US'],
    ['Czech Republic', 'CZ'],
    ['Czechia', 'CZ'],
    ['GHANA', 'GH'],
    ['London, Ontario', 'CA'],
    ['London, UK', 'GB'],
    ['London, United Kingdom', 'GB'],
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
    'Beijing University of Technology, Beijing 100124, PR China',
    'Fayetteville GA (near Atlanta)',
    'London',
    'Mars',
    'New York City and Los Angeles',
    'Southeast Asia',
    'The UK',
  ])("doesn't guess %s", input => {
    const actual = _.guessCountry(input)

    expect(actual).toStrictEqual(Option.none())
  })
})
