import { type Predicate, Schema } from 'effect'

export type PreprintServer = keyof typeof preprintServers

export const preprintServers = {
  advance: 'Advance',
  africarxiv: 'AfricArXiv Preprints',
  'arcadia-science': 'Arcadia Science',
  arxiv: 'arXiv',
  authorea: 'Authorea',
  biorxiv: 'bioRxiv',
  chemrxiv: 'ChemRxiv',
  curvenote: 'Curvenote',
  eartharxiv: 'EarthArXiv',
  ecoevorxiv: 'EcoEvoRxiv',
  edarxiv: 'EdArXiv',
  engrxiv: 'engrXiv',
  jxiv: 'Jxiv',
  'lifecycle-journal': 'Lifecycle Journal',
  medrxiv: 'medRxiv',
  metaarxiv: 'MetaArXiv',
  neurolibre: 'NeuroLibre',
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
  ssrn: 'SSRN',
  techrxiv: 'TechRxiv',
  verixiv: 'VeriXiv',
  zenodo: 'Zenodo',
} as const

const isPreprintServer: Predicate.Refinement<unknown, PreprintServer> = (u): u is PreprintServer =>
  typeof u === 'string' && Object.hasOwn(preprintServers, u)

export const PreprintServerSchema = Schema.String.pipe(Schema.filter(isPreprintServer))
