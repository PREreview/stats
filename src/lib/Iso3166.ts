import { rawTimeZones } from '@vvo/tzdb'
import cities from 'all-the-cities'
import diacritics from 'diacritics'
import { Array, Option, Order, type Predicate, Schema, String, flow } from 'effect'
import iso3166 from 'i18n-iso-countries'
import subDivisions from 'world_countries_lists/data/subdivisions/subdivisions.json'

export type Alpha2Code = iso3166.Alpha2Code

export const isAlpha2Code: Predicate.Refinement<unknown, Alpha2Code> = (u): u is Alpha2Code =>
  typeof u === 'string' && u in iso3166.getAlpha2Codes()

export const Alpha2CodeSchema: Schema.Schema<Alpha2Code, string> = Schema.String.pipe(Schema.filter(isAlpha2Code))

const cities10000 = Array.filter(
  Array.sortWith(cities, city => city.population, Order.reverse(Order.number)),
  city => city.population >= 10_000,
)

export const guessCountry: (location: string) => Option.Option<Alpha2Code> = flow(
  String.replaceAll('.', ''),
  String.replaceAll(/\((.+?)\)/g, ', $1'),
  String.replaceAll(/ [0-9]+/g, ' '),
  String.replaceAll(/( and | - )/gi, ', '),
  String.replaceAll(/(^| )(the|near|greater) /gi, ''),
  location => Array.prepend(Array.map(location.split(',').reverse(), String.trim), location),
  Array.findFirst(location =>
    Option.fromNullable(iso3166.getAlpha2Code(location, 'en')).pipe(
      Option.orElse(() => Option.fromNullable(iso3166.getAlpha2Code(location, 'es'))),
      Option.orElse(() => Option.fromNullable(iso3166.getAlpha2Code(location, 'pt'))),
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
        location.length === 2
          ? Option.map(
              Array.findFirst(subDivisions, subDivision => subDivision.code === `US-${location}`),
              subDivision => subDivision.country,
            )
          : Option.none(),
      ),
      Option.orElse(() =>
        Option.map(
          Array.matchLeft(
            Array.filter(rawTimeZones, timezone =>
              Array.some(
                timezone.mainCities,
                mainCity => diacritics.remove(location).toLowerCase() === diacritics.remove(mainCity).toLowerCase(),
              ),
            ),
            {
              onEmpty: () => Option.none(),
              onNonEmpty: (head, tail) =>
                Array.match(tail, {
                  onEmpty: () => Option.some(head),
                  onNonEmpty: Option.none,
                }),
            },
          ),
          timeZone => timeZone.countryCode,
        ),
      ),
      Option.orElse(() =>
        Option.map(
          Array.findFirst(
            cities10000,
            city => diacritics.remove(location).toLowerCase() === diacritics.remove(city.name).toLowerCase(),
          ),
          city => city.country,
        ),
      ),
    ),
  ),
  Option.filter(isAlpha2Code),
)
