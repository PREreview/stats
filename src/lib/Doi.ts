import { ParseResult, Schema } from '@effect/schema'
import { Brand, Either, Option, type Predicate, String, flow } from 'effect'

export type Doi = Brand.Branded<string, 'Doi'>

const isDoi: Predicate.Refinement<unknown, Doi> = (u): u is Doi =>
  typeof u === 'string' && /^10[.][0-9]{2,}(?:[.][0-9]+)*\/\S+$/.test(u) && !u.endsWith('/.') && !u.endsWith('/..')

export const Doi = Brand.refined<Doi>(isDoi, s => Brand.error(`Expected ${s} to be a DOI`))

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

const LowercasedStringSchema = Schema.transform(Schema.String, Schema.String.pipe(Schema.lowercased()), {
  decode: s => s.toLowerCase(),
  encode: s => s,
})

export const DoiSchema = LowercasedStringSchema.pipe(Schema.fromBrand(Doi))

export const ParseDoiSchema: Schema.Schema<Doi, string> = Schema.transformOrFail(
  LowercasedStringSchema,
  Schema.typeSchema(DoiSchema),
  {
    decode: s => Either.fromOption(parse(s), () => new ParseResult.Type(DoiSchema.ast, s)),
    encode: ParseResult.succeed,
  },
)
