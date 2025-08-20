---
theme: dashboard
title: PREreviews
toc: false
---

# PREreviews ✍️

```js
import { capitalize } from 'npm:effect/String'

const parseDate = d3.utcParse('%Y-%m-%d')
const languageNames = new Intl.DisplayNames(['en-US'], { type: 'language' })
const languageName = code => (code ? languageNames.of(code) : 'Unknown')

const preprintServers = FileAttachment('./data/preprint-servers.json').json()
const reviews = FileAttachment('./data/reviews.json')
  .json()
  .then(data => data.map(review => ({ ...review, createdAt: parseDate(review.createdAt) })))

const openAlexDomains = FileAttachment('./data/openalex-domains.json').json()
const openAlexFields = FileAttachment('./data/openalex-fields.json').json()
```

```js
const now = new Date()
const firstReview = d3.min(reviews, review => review.createdAt)

const preprintServerName = id => preprintServers[id]

const reviewType = id => {
  switch (id) {
    case 'full':
      return 'Full'
    case 'structured':
      return 'Structured'
    case 'rapid':
      return 'Rapid'
    default:
      return id
  }
}
```

```js
const chosenYear = view(
  Inputs.select([null, ..._.range(now.getUTCFullYear(), firstReview.getUTCFullYear() - 1)], {
    label: 'Year',
    format: year => year ?? 'All-time',
  }),
)

const chosenType = view(
  Inputs.select([null, 'full', 'structured', 'rapid'], {
    label: 'PREreview type',
    format: type => reviewType(type) ?? 'All',
  }),
)

const chosenDomain = view(
  Inputs.select([null, ...Object.keys(openAlexDomains)], {
    label: 'Domain',
    format: domain => (domain ? openAlexDomains[domain] : 'All domains'),
  }),
)

const chosenCollaborative = view(Inputs.toggle({ label: 'Collaborative' }))

const chosenClub = view(Inputs.toggle({ label: 'In a club' }))

const chosenRequest = view(Inputs.toggle({ label: 'Requested review' }))

const chosenPseudonym = view(Inputs.toggle({ label: 'With a pseudonym' }))
```

```js
const reviewsInTimePeriod = chosenYear
  ? reviews.filter(review => review.createdAt.getUTCFullYear() === chosenYear)
  : reviews

const reviewsInDomain = chosenDomain
  ? reviewsInTimePeriod.filter(d => d.domains.includes(chosenDomain))
  : reviewsInTimePeriod

const reviewsCollaborative = chosenCollaborative
  ? reviewsInDomain.filter(review => review.authors.length > 1)
  : reviewsInDomain

const reviewsWithRequest = chosenRequest
  ? reviewsCollaborative.filter(review => review.requested)
  : reviewsCollaborative

const reviewsClub = chosenClub ? reviewsWithRequest.filter(review => review.club) : reviewsWithRequest

const reviewsWithPseudonym = chosenPseudonym
  ? reviewsClub.filter(review => review.authors.some(author => author.authorType === 'pseudonym'))
  : reviewsClub

const reviewsSelected = chosenType
  ? reviewsWithPseudonym.filter(review => review.type === chosenType)
  : reviewsWithPseudonym

const reviewsByField = reviewsSelected
  .flatMap(({ fields, ...review }) => fields.map(field => ({ ...review, field })))
  .map(({ field, ...review }) => ({ ...review, field: openAlexFields[field].name }))

const languageColor = Plot.scale({
  color: {
    type: 'categorical',
    domain: [
      'en',
      ...d3
        .groupSort(
          reviews,
          reviews => -reviews.length,
          review => review.language,
        )
        .filter(language => language !== 'en' && language !== undefined),
    ],
    unknown: 'var(--theme-foreground-muted)',
  },
})

const title = capitalize(
  `${chosenCollaborative ? 'collaborative ' : ''}${chosenRequest ? 'requested ' : ''}${chosenDomain ? `${openAlexDomains[chosenDomain]} ` : ''}${chosenClub ? 'club ' : ''}${chosenType ? reviewType(chosenType) : ''} PREreviews${chosenPseudonym ? ' using a pseudonym' : ''}`,
)

const titleWithYear = `${title} ${chosenYear ? ` in ${chosenYear}` : ''}`
```

<div class="grid grid-cols-4">
  <div class="card">
    <h2>${titleWithYear}</h2>
    <span class="big">${reviewsSelected.length.toLocaleString("en-US")}</span>
    ${chosenClub | chosenCollaborative | chosenPseudonym | chosenRequest | chosenType ? html`
      <div>${d3.format(".1%")(reviewsSelected.length / reviewsInTimePeriod.length)} of all PREreviews</div>
    ` : ''}
  </div>
</div>

```js
function reviewsTimeline({ width } = {}) {
  return Plot.plot({
    title: `${title} per ${chosenYear ? 'week' : 'month'}`,
    width: Math.max(width, 600),
    height: 400,
    color: {
      ...languageColor,
      legend: true,
      tickFormat: languageName,
    },
    y: { grid: true, label: 'PREreviews', tickFormat: Math.floor, interval: 1 },
    x: {
      label: '',
      domain: chosenYear
        ? [new Date(chosenYear, 0, 1, 0, 0, 0, 0), new Date(chosenYear + 1, 0, 1, 0, 0, 0, 0)]
        : [d3.utcMonth.floor(firstReview), d3.utcMonth.ceil(now)],
    },
    marks: [
      Plot.rectY(
        reviewsSelected,
        Plot.binX(
          { y: 'count' },
          {
            x: 'createdAt',
            interval: chosenYear ? d3.utcWeek : d3.utcMonth,
            fill: 'language',
            order: languageColor.domain,
            tip: {
              format: {
                fill: languageName,
              },
            },
          },
        ),
      ),
    ],
  })
}
```

<div class="grid grid-cols-1">
  <div class="card">
    ${resize((width) => reviewsTimeline({width}))}
  </div>
</div>

```js
function reviewsByFieldTimeline({ width } = {}) {
  return Plot.plot({
    title: `${titleWithYear} by field (reviews may have multiple fields)`,
    width: Math.max(width, 600),
    color: {
      ...languageColor,
      legend: true,
      tickFormat: languageName,
    },
    x: { grid: true, label: 'Reviews', tickFormat: Math.floor, interval: 1 },
    y: { label: '' },
    marks: [
      Plot.barX(
        reviewsByField,
        Plot.groupY(
          {
            x: 'count',
          },
          {
            y: 'field',
            fill: 'language',
            order: languageColor.domain,
            sort: { y: 'x', reverse: true },
            tip: {
              format: {
                fill: languageName,
                y: false,
              },
            },
          },
        ),
      ),
      Plot.axisY({ lineWidth: 20, marginLeft: 220 }),
    ],
  })
}
```

<div class="grid grid-cols-1">
  <div class="card">
    ${resize((width) => reviewsByFieldTimeline({width}))}
  </div>
</div>

```js
function reviewsByPreprintServer({ width } = {}) {
  return Plot.plot({
    title: `${titleWithYear} by preprint server`,
    width: Math.max(width, 600),
    color: {
      ...languageColor,
      legend: true,
      tickFormat: languageName,
    },
    x: { grid: true, label: 'Reviews', tickFormat: Math.floor, interval: 1 },
    y: { label: '' },
    marks: [
      Plot.barX(
        reviewsSelected.map(review => ({ ...review, server: preprintServerName(review.server) })),
        Plot.groupY(
          {
            x: 'count',
          },
          {
            y: 'server',
            fill: 'language',
            order: languageColor.domain,
            sort: { y: 'x', reverse: true },
            tip: {
              format: {
                fill: languageName,
                y: false,
              },
            },
          },
        ),
      ),
      Plot.axisY({ lineWidth: 15, marginLeft: 115 }),
    ],
  })
}
```

<div class="grid grid-cols-1">
  <div class="card">
    ${resize((width) => reviewsByPreprintServer({width}))}
  </div>
</div>
