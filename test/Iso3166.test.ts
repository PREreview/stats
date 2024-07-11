import { Option } from 'effect'
import { describe, expect, test } from 'vitest'
import * as _ from '../src/lib/Iso3166.js'

describe('guessCountry', () => {
  test.for([
    ['Czech Republic', 'CZ'],
    ['Czechia', 'CZ'],
    ['GHANA', 'GH'],
    ['UK', 'GB'],
    ['United Kingdom', 'GB'],
    ['united states', 'US'],
  ])('guesses %s', ([input, expected]) => {
    const actual = _.guessCountry(input)

    expect(actual).toStrictEqual(Option.some(expected))
  })

  test.for([
    'Algiers ( Algeria)',
    'Baylor College of Medicine, Houston, Texas',
    'Beijing University of Technology, Beijing 100124, PR China',
    'Chicago, IL, USA',
    'Colorado - United States',
    'Fayetteville GA (near Atlanta)',
    'London',
    'London, Ontario',
    'London, UK',
    'London, United Kingdom',
    'Mars',
    'New York City and Los Angeles',
    'Québec',
    'Rio de Janeiro, Brazil.',
    'Southeast Asia',
    'Sunnyvale, California',
    'The UK',
    'U.K.',
    'Washington, DC',
  ])("doesn't guess %s", input => {
    const actual = _.guessCountry(input)

    expect(actual).toStrictEqual(Option.none())
  })
})
