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
export const OrcidId = Brand.refined<OrcidId>(isOrcidId, s => Brand.error(`Expected ${s} to be an ORCiD ID`))

export const OrcidIdSchema = Schema.String.pipe(Schema.fromBrand(OrcidId))
