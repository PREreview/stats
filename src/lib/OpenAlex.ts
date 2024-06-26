import { ParseResult, Schema } from '@effect/schema'
import { Brand, Either } from 'effect'
import { UrlFromSelfSchema } from './Url.js'

type FieldId = string & Brand.Brand<'OpenAlexFieldId'>

const FieldId = Brand.nominal<FieldId>()

export const FieldIdSchema = Schema.String.pipe(Schema.fromBrand(FieldId))

export const FieldIdFromUrlSchema = Schema.transformOrFail(UrlFromSelfSchema, FieldIdSchema, {
  decode: (url, _, ast) =>
    url.origin === 'https://openalex.org' && url.pathname.startsWith('/fields/')
      ? Either.right(decodeURIComponent(url.pathname.substring(8)))
      : Either.left(new ParseResult.Type(ast, url)),
  encode: topicId => ParseResult.succeed(new URL(`https://openalex.org/fields/${encodeURIComponent(topicId)}`)),
})
