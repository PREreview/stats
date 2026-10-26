import { Brand, Effect, Schema, SchemaIssue, SchemaTransformation } from 'effect'

type SubfieldId = string & Brand.Brand<'OpenAlexSubfieldId'>

const SubfieldId = Brand.nominal<SubfieldId>()

export const SubfieldIdSchema = Schema.String.pipe(Schema.fromBrand('OpenAlexSubfieldId', SubfieldId))

export const SubfieldIdFromUrlSchema = Schema.URL.pipe(
  Schema.decodeTo(
    SubfieldIdSchema,
    SchemaTransformation.transformEffect({
      decode: (url, options) =>
        url.origin === 'https://openalex.org' && url.pathname.startsWith('/subfields/')
          ? Effect.succeed(decodeURIComponent(url.pathname.substring(11)))
          : Effect.fail(new SchemaIssue.InvalidValue(undefined, url, options)),
      encode: topicId => Effect.succeed(new URL(`https://openalex.org/subfields/${encodeURIComponent(topicId)}`)),
    }),
  ),
)

type FieldId = string & Brand.Brand<'OpenAlexFieldId'>

const FieldId = Brand.nominal<FieldId>()

export const FieldIdSchema = Schema.String.pipe(Schema.fromBrand('OpenAlexFieldId', FieldId))

export const FieldIdFromUrlSchema = Schema.URL.pipe(
  Schema.decodeTo(
    FieldIdSchema,
    SchemaTransformation.transformEffect({
      decode: (url, options) =>
        url.origin === 'https://openalex.org' && url.pathname.startsWith('/fields/')
          ? Effect.succeed(decodeURIComponent(url.pathname.substring(8)))
          : Effect.fail(new SchemaIssue.InvalidValue(undefined, url, options)),
      encode: topicId => Effect.succeed(new URL(`https://openalex.org/fields/${encodeURIComponent(topicId)}`)),
    }),
  ),
)

type DomainId = string & Brand.Brand<'OpenAlexDomainId'>

const DomainId = Brand.nominal<DomainId>()

export const DomainIdSchema = Schema.String.pipe(Schema.fromBrand('OpenAlexDomainId', DomainId))

export const DomainIdFromUrlSchema = Schema.URL.pipe(
  Schema.decodeTo(
    DomainIdSchema,
    SchemaTransformation.transformEffect({
      decode: (url, options) =>
        url.origin === 'https://openalex.org' && url.pathname.startsWith('/domains/')
          ? Effect.succeed(decodeURIComponent(url.pathname.substring(9)))
          : Effect.fail(new SchemaIssue.InvalidValue(undefined, url, options)),
      encode: topicId => Effect.succeed(new URL(`https://openalex.org/domains/${encodeURIComponent(topicId)}`)),
    }),
  ),
)
