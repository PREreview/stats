import { Option } from 'effect'
import { describe, expect, test } from 'vitest'
import * as _ from '../src/lib/Iso3166.js'

describe('guessCountry', () => {
  test.for([
    ['Chicago, IL, USA', 'US'],
    ['Czech Republic', 'CZ'],
    ['Czechia', 'CZ'],
    ['GHANA', 'GH'],
    ['London, UK', 'GB'],
    ['London, United Kingdom', 'GB'],
    ['Rio de Janeiro, Brazil.', 'BR'],
    ['UK', 'GB'],
    ['U.K.', 'GB'],
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
    'Colorado - United States',
    'Fayetteville GA (near Atlanta)',
    'London',
    'London, Ontario',
    'Mars',
    'New York City and Los Angeles',
    'Québec',
    'Southeast Asia',
    'Sunnyvale, California',
    'The UK',
    'Washington, DC',
  ])("doesn't guess %s", input => {
    const actual = _.guessCountry(input)

    expect(actual).toStrictEqual(Option.none())
  })
})
