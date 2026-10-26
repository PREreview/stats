import { Schema } from 'effect'
import { describe, expect, test } from 'vitest'
import * as _ from '../src/lib/PreprintServer.js'

describe('PreprintServerSchema', () => {
  test.for(['biorxiv', 'osf-preprints', 'preprints.org', 'zenodo'])('decodes %s', input => {
    const actual = Schema.decodeUnknownSync(_.PreprintServerSchema)(input)

    expect(actual).toStrictEqual(input)
  })

  test.for(['', 'bioRxiv', 'unknown', 'toString', 123])("doesn't decode %s", input => {
    expect(() => Schema.decodeUnknownSync(_.PreprintServerSchema)(input)).toThrow()
  })

  test('encodes', () => {
    const actual = Schema.encodeSync(_.PreprintServerSchema)('biorxiv')

    expect(actual).toStrictEqual('biorxiv')
  })
})
