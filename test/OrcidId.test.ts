import { Schema } from 'effect'
import { describe, expect, test } from 'vitest'
import * as _ from '../src/lib/OrcidId.js'

describe('OrcidIdSchema', () => {
  test.for(['0000-0002-1825-0097', '0000-0002-1694-233X'])('decodes %s', input => {
    const actual = Schema.decodeUnknownSync(_.OrcidIdSchema)(input)

    expect(actual).toStrictEqual(input)
  })

  test.for([
    '',
    'not an orcid',
    '0000000218250097',
    'https://orcid.org/0000-0002-1825-0097',
    '0000-0002-1825-0098',
    '0000-0002-1694-233x',
    123,
  ])("doesn't decode %s", input => {
    expect(() => Schema.decodeUnknownSync(_.OrcidIdSchema)(input)).toThrow()
  })

  test('encodes', () => {
    const actual = Schema.encodeSync(_.OrcidIdSchema)(_.OrcidId('0000-0002-1825-0097'))

    expect(actual).toStrictEqual('0000-0002-1825-0097')
  })
})
