import { Schema } from '@effect/schema'
import { Option, type Predicate } from 'effect'
import iso3166 from 'i18n-iso-countries'

export type Alpha2Code = iso3166.Alpha2Code

export const isAlpha2Code: Predicate.Refinement<unknown, Alpha2Code> = (u): u is Alpha2Code =>
  typeof u === 'string' && u in iso3166.getAlpha2Codes()

export const Alpha2CodeSchema: Schema.Schema<Alpha2Code, string> = Schema.String.pipe(Schema.filter(isAlpha2Code))

export const guessCountry = (location: string): Option.Option<Alpha2Code> =>
  Option.fromNullable(iso3166.getAlpha2Code(location, 'en')).pipe(Option.filter(isAlpha2Code))
