import { Schema } from '@effect/schema'
import { rawTimeZones } from '@vvo/tzdb'
import diacritics from 'diacritics'
import { Array, Option, type Predicate, String, flow } from 'effect'
import iso3166 from 'i18n-iso-countries'
import subDivisions from 'world_countries_lists/data/subdivisions/subdivisions.json'

export type Alpha2Code = iso3166.Alpha2Code

export const isAlpha2Code: Predicate.Refinement<unknown, Alpha2Code> = (u): u is Alpha2Code =>
  typeof u === 'string' && u in iso3166.getAlpha2Codes()

export const Alpha2CodeSchema: Schema.Schema<Alpha2Code, string> = Schema.String.pipe(Schema.filter(isAlpha2Code))

export const guessCountry: (location: string) => Option.Option<Alpha2Code> = flow(
  String.replaceAll('.', ''),
  String.replaceAll(/\((.+?)\)/g, ', $1'),
  String.replaceAll(/ [0-9]+/g, ' '),
  String.replaceAll(/( and | - )/gi, ', '),
  location => Array.prepend(Array.map(location.split(',').reverse(), String.trim), location),
  Array.findFirst(location =>
    Option.fromNullable(iso3166.getAlpha2Code(location, 'en')).pipe(
      Option.orElse(() =>
        Option.map(
          Array.findFirst(
            subDivisions,
            subDivision => diacritics.remove(location).toLowerCase() === subDivision.name.toLowerCase(),
          ),
          subDivision => subDivision.country,
        ),
      ),
      Option.orElse(() =>
        Option.map(
          Array.findFirst(rawTimeZones, timezone =>
            Array.some(
              timezone.mainCities,
              mainCity => diacritics.remove(location).toLowerCase() === diacritics.remove(mainCity).toLowerCase(),
            ),
          ),
          timeZone => timeZone.countryCode,
        ),
      ),
    ),
  ),
  Option.filter(isAlpha2Code),
)
