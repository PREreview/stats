import { Schema } from '@effect/schema'
import type { Predicate } from 'effect'

export type PreprintServer = keyof typeof preprintServers

export const preprintServers = {
  africarxiv: 'AfricArXiv Preprints',
  arxiv: 'arXiv',
  authorea: 'Authorea',
  biorxiv: 'bioRxiv',
  chemrxiv: 'ChemRxiv',
  eartharxiv: 'EarthArXiv',
  ecoevorxiv: 'EcoEvoRxiv',
  edarxiv: 'EdArXiv',
  engrxiv: 'engrXiv',
  medrxiv: 'medRxiv',
  metaarxiv: 'MetaArXiv',
  osf: 'OSF',
  'osf-preprints': 'OSF Preprints',
  philsci: 'PhilSci-Archive',
  'preprints.org': 'Preprints.org',
  psyarxiv: 'PsyArXiv',
  psycharchives: 'PsychArchives',
  'research-square': 'Research Square',
  scielo: 'SciELO Preprints',
  'science-open': 'ScienceOpen Preprints',
  socarxiv: 'SocArXiv',
  techrxiv: 'TechRxiv',
  zenodo: 'Zenodo',
} as const

const isPreprintServer: Predicate.Refinement<unknown, PreprintServer> = (u): u is PreprintServer =>
  typeof u === 'string' && Object.hasOwn(preprintServers, u)

export const PreprintServerSchema = Schema.String.pipe(Schema.filter(isPreprintServer))
