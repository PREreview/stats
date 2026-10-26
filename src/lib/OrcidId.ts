import { Brand, type Predicate, Schema } from 'effect'
import orcidUtils from 'orcid-utils'

export type OrcidId = Brand.Branded<string, 'OrcidId'>

const isOrcidId: Predicate.Refinement<unknown, OrcidId> = (u): u is OrcidId => {
  try {
    return typeof u === 'string' && orcidUtils.toDashFormat(u) === u
  } catch {
    return false
  }
}
export const OrcidId = Brand.make<OrcidId>(s => isOrcidId(s) || `Expected ${s} to be an ORCiD ID`)

export const OrcidIdSchema = Schema.String.pipe(Schema.fromBrand('OrcidId', OrcidId))
