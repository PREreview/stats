import { Option } from 'effect'
import { describe, expect, test } from 'vitest'
import * as _ from '../src/lib/Iso3166.js'

describe('guessCountry', () => {
  test.for([
    ['UK', 'GB'],
    ['United Kingdom', 'GB'],
  ])('%s', ([input, expected]) => {
    const actual = _.guessCountry(input)

    expect(actual).toStrictEqual(Option.some(expected))
  })
})
