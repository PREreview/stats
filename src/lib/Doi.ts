import { Brand, Effect, Option, type Predicate, Schema, SchemaIssue, SchemaTransformation, String, flow } from 'effect'

export type Doi = Brand.Branded<string, 'Doi'>

const isDoi: Predicate.Refinement<unknown, Doi> = (u): u is Doi =>
  typeof u === 'string' && /^10[.][0-9]{2,}(?:[.][0-9]+)*\/\S+$/.test(u) && !u.endsWith('/.') && !u.endsWith('/..')

export const Doi = Brand.make<Doi>(s => isDoi(s) || `Expected ${s} to be a DOI`)

const parse: (s: string) => Option.Option<Doi> = flow(String.trim, s => {
  if (isDoi(s)) {
    return Option.some(s)
  }

  if (s.startsWith('doi:')) {
    return Option.liftPredicate(isDoi)(s.substring(4))
  }

  try {
    const url = new URL(s)

    if (!['http:', 'https:'].includes(url.protocol) || !['doi.org', 'dx.doi.org'].includes(url.hostname)) {
      return Option.none()
    }

    return Option.liftPredicate(isDoi)(decodeURIComponent(url.pathname).substring(1))
  } catch {
    return Option.liftPredicate(isDoi)(s)
  }
})

const LowercasedStringSchema = Schema.String.pipe(
  Schema.decodeTo(Schema.String.check(Schema.isLowercased()), SchemaTransformation.toLowerCase()),
)

export const DoiSchema = LowercasedStringSchema.pipe(Schema.fromBrand('Doi', Doi))

export const ParseDoiSchema: Schema.Codec<Doi, string> = LowercasedStringSchema.pipe(
  Schema.decodeTo(
    Schema.toType(DoiSchema),
    SchemaTransformation.transformEffect({
      decode: (s, options) =>
        Option.match(parse(s), {
          onNone: () => Effect.fail(new SchemaIssue.InvalidValue(undefined, s, options)),
          onSome: Effect.succeed,
        }),
      encode: Effect.succeed,
    }),
  ),
)
