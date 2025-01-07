---
theme: dashboard
title: PREreviews
toc: false
---

# PREreviews ✍️

```js
const parseDate = d3.utcParse('%Y-%m-%d')
const languageNames = new Intl.DisplayNames(['en-US'], { type: 'language' })
const languageName = code => (code ? languageNames.of(code) : 'Unknown')

const preprintServers = FileAttachment('./data/preprint-servers.json').json()
const reviews = FileAttachment('./data/reviews.json')
  .json()
  .then(data => data.map(review => ({ ...review, createdAt: parseDate(review.createdAt) })))
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

const chosenCollaborative = view(Inputs.toggle({ label: 'Collaborative' }))

const chosenRequest = view(Inputs.toggle({ label: 'Requested review' }))

const chosenPseudonym = view(Inputs.toggle({ label: 'With a pseudonym' }))
```

```js
const reviewsInTimePeriod = chosenYear
  ? reviews.filter(review => review.createdAt.getUTCFullYear() === chosenYear)
  : reviews

const reviewsCollaborative = chosenCollaborative
  ? reviewsInTimePeriod.filter(review => review.authors.length > 1)
  : reviewsInTimePeriod

const reviewsWithRequest = chosenRequest
  ? reviewsCollaborative.filter(review => review.requested)
  : reviewsCollaborative

const reviewsWithPseudonym = chosenPseudonym
  ? reviewsWithRequest.filter(review => review.authors.some(author => author.authorType === 'pseudonym'))
  : reviewsWithRequest

const reviewsSelected = chosenType
  ? reviewsWithPseudonym.filter(review => review.type === chosenType)
  : reviewsWithPseudonym

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
```

<div class="grid grid-cols-4">
  <div class="card">
    <h2>${chosenCollaborative ? 'Collaborative ' : ''}${chosenRequest ? (chosenCollaborative ? 'requested ' : 'Requested ') : ''}${chosenType ? reviewType(chosenType) : ''} PREreviews${chosenPseudonym ? ' using a pseudonym' : ''} ${chosenYear ? ` in ${chosenYear}` : ''}</h2>
    <span class="big">${reviewsSelected.length.toLocaleString("en-US")}</span>
    ${chosenCollaborative | chosenPseudonym | chosenRequest | chosenType ? html`
      <div>${d3.format(".1%")(reviewsSelected.length / reviewsInTimePeriod.length)} of all PREreviews</div>
    ` : ''}
  </div>
</div>

```js
function reviewsTimeline({ width } = {}) {
  return Plot.plot({
    title: `${chosenCollaborative ? 'Collaborative ' : ''}${chosenRequest ? (chosenCollaborative ? 'requested ' : 'Requested ') : ''}${chosenType ? reviewType(chosenType) : ''} PREreviews${chosenPseudonym ? ' using a pseudonym' : ''} per ${chosenYear ? 'week' : 'month'}`,
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
function reviewsByPreprintServer({ width } = {}) {
  return Plot.plot({
    title: `${chosenCollaborative ? 'Collaborative ' : ''}${chosenRequest ? (chosenCollaborative ? 'requested ' : 'Requested ') : ''}${chosenType ? reviewType(chosenType) : ''} PREreviews ${chosenPseudonym ? ' using a pseudonym' : ''} ${chosenYear ? `in ${chosenYear}` : ''} by preprint server`,
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
