---
title: Review requests
toc: false
---

# Review requests

```js
const parseTimestamp = d3.utcParse('%Y-%m-%dT%H:%M:%S.%LZ')
const languageNames = new Intl.DisplayNames(['en-US'], { type: 'language' })
const languageName = code => (code ? languageNames.of(code) : 'Not yet detected')

const preprintServers = FileAttachment('./data/preprint-servers.json').json()
const requests = FileAttachment('./data/requests.json')
  .json()
  .then(data => data.map(request => ({ ...request, timestamp: parseTimestamp(request.timestamp) })))
const reviews = FileAttachment('./data/reviews.json').json()

const openAlexDomains = FileAttachment('./data/openalex-domains.json').json()
const openAlexFields = FileAttachment('./data/openalex-fields.json').json()
const openAlexSubfields = FileAttachment('./data/openalex-subfields.json').json()
```

```js
const now = new Date()
const firstRequest = d3.min(requests, request => request.timestamp)

const preprintServerName = id => preprintServers[id] ?? 'Unknown'
```

```js
const chosenYear = view(
  Inputs.select([null, ..._.range(now.getUTCFullYear(), firstRequest.getUTCFullYear() - 1)], {
    label: 'Year',
    format: year => year ?? 'All-time',
  }),
)
```

```js
const chosenDomain = view(
  Inputs.select([null, ...Object.keys(openAlexDomains)], {
    label: 'Domain',
    format: domain => (domain ? openAlexDomains[domain] : 'All domains'),
  }),
)
```

```js
const chosenField = view(
  Inputs.select(
    [
      null,
      ...Object.keys(
        Object.fromEntries(
          Object.entries(openAlexFields).filter(([, field]) => (chosenDomain ? field.domain === chosenDomain : true)),
        ),
      ),
    ],
    {
      label: 'Field',
      disabled: chosenDomain === null,
      format: field => (field ? openAlexFields[field].name : 'All fields'),
    },
  ),
)
```

```js
const requestsInTimePeriod = (
  chosenYear ? requests.filter(request => request.timestamp.getUTCFullYear() === chosenYear) : requests
).map(request => ({ ...request, server: preprintServerName(request.server) }))

const requestsSelected = chosenField
  ? requestsInTimePeriod.filter(d => d.fields.includes(chosenField))
  : chosenDomain
    ? requestsInTimePeriod.filter(d => d.domains.includes(chosenDomain))
    : requestsInTimePeriod
```

```js
const languageColor = Plot.scale({
  color: {
    type: 'categorical',
    domain: [
      'en',
      ...d3
        .groupSort(
          requests,
          requests => -requests.length,
          request => request.language,
        )
        .filter(language => language !== 'en' && language !== undefined),
    ],
    unknown: 'var(--theme-foreground-muted)',
  },
})

const requestedReviews = d3.filter(reviews, review => review.requested)

const requestsGroupedByPreprint = d3.group(requestsSelected, request => request.preprint)
const reviewsGroupedByPreprint = d3.group(requestedReviews, reviews => reviews.preprint)

const requestsWithAReview = d3.filter(requestsSelected, request => reviewsGroupedByPreprint.has(request.preprint))
const requestsWithAReviewGroupedByPreprint = d3.group(requestsWithAReview, request => request.preprint)

const requestsByField = requestsSelected
  .flatMap(({ fields, ...request }) => fields.map(field => ({ ...request, field })))
  .filter(request => (chosenDomain ? openAlexFields[request.field].domain === chosenDomain : true))
  .map(({ field, ...request }) => ({ ...request, field: openAlexFields[field].name }))

const requestsBySubfield = requestsSelected
  .flatMap(({ subfields, ...request }) => subfields.map(subfield => ({ ...request, subfield })))
  .filter(request =>
    chosenField
      ? openAlexSubfields[request.subfield].field === chosenField
      : chosenDomain
        ? openAlexFields[openAlexSubfields[request.subfield].field].domain === chosenDomain
        : true,
  )
  .map(({ subfield, ...request }) => ({ ...request, subfield: openAlexSubfields[subfield].name }))
```

<div class="grid grid-cols-4">
  <div class="card">
    <h2>${chosenField ? `${openAlexFields[chosenField].name} requests` : chosenDomain ? `${openAlexDomains[chosenDomain]} requests` : 'Requests'} ${chosenYear ? `in ${chosenYear}` : ''}</h2> 
    <span class="big">${requestsSelected.length.toLocaleString("en-US")}</span>
    ${requestsGroupedByPreprint.size !== requestsSelected.length ? html`
      <span class="muted">for ${requestsGroupedByPreprint.size.toLocaleString("en-US")} preprints</span>
    ` : ''}
    ${chosenField ? html`
      <div>${d3.format(".1%")(requestsSelected.length / requestsInTimePeriod.filter(d => d.domains.includes(chosenDomain)).length)} of all ${openAlexDomains[chosenDomain]} requests</div>
    ` : ''}
    ${chosenDomain ? html`
      <div>${d3.format(".1%")(requestsSelected.length / requestsInTimePeriod.length)} of all requests</div>
    ` : ''}
  </div>
  <div class="card">
    <h2>With a PREreview</h2>
    <span class="big">${requestsWithAReview.length.toLocaleString('en-US')}</span>
    ${requestsWithAReviewGroupedByPreprint.size !== requestsWithAReview.length ? html`
      <span class="muted">for ${requestsWithAReviewGroupedByPreprint.size.toLocaleString("en-US")} preprints</span>
    ` : ''}
    ${requestsWithAReviewGroupedByPreprint.size === 0 ? '' :
      chosenField ? html`
        <div>${d3.format(".1%")(requestsWithAReview.length / requestsInTimePeriod.filter(d => d.fields.includes(chosenField)).length)} of all ${openAlexFields[chosenField].name} requests ${chosenYear ? `in ${chosenYear}` : ''}</div>
      ` : chosenDomain ? html`
        <div>${d3.format(".1%")(requestsWithAReview.length / requestsInTimePeriod.filter(d => d.domains.includes(chosenDomain)).length)} of all ${openAlexDomains[chosenDomain]} requests ${chosenYear ? `in ${chosenYear}` : ''}</div>
      ` : html`
        <div>${d3.format(".1%")(requestsWithAReview.length / requestsInTimePeriod.length)} of all requests ${chosenYear ? `in ${chosenYear}` : ''}</div>
      `}
  </div>
</div>

```js
function requestsByLanguageTimeline({ width } = {}) {
  return Plot.plot({
    title: chosenField
      ? `${openAlexFields[chosenField].name} requests per week`
      : chosenDomain
        ? `${openAlexDomains[chosenDomain]} requests per week`
        : 'Requests per week',
    width: Math.max(width, 600),
    height: 400,
    color: {
      ...languageColor,
      legend: true,
      tickFormat: languageName,
    },
    y: { grid: true, label: 'Requests', tickFormat: Math.floor, interval: 1 },
    x: {
      label: '',
      domain: chosenYear
        ? [
            d3.utcSunday.floor(new Date(chosenYear, 0, 1, 0, 0, 0, 0)),
            d3.utcSunday.ceil(new Date(chosenYear + 1, 0, 1, 0, 0, 0, 0)),
          ]
        : [d3.utcSunday.floor(firstRequest), d3.utcSunday.ceil(now)],
    },
    marks: [
      Plot.rectY(
        requestsSelected,
        Plot.binX(
          { y: 'count' },
          {
            x: 'timestamp',
            interval: d3.utcWeek,
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
      Plot.ruleY([0]),
    ],
  })
}
```

<div class="grid grid-cols-1">
  <div class="card">
    ${resize((width) => requestsByLanguageTimeline({width}))}
  </div>
</div>

```js
function requestsByFieldTimeline({ width } = {}) {
  return Plot.plot({
    title: chosenField
      ? `Subfields of ${openAlexFields[chosenField].name} requests ${chosenYear ? `in ${chosenYear}` : ''} (request may have multiple subfields)`
      : chosenDomain
        ? `Fields of ${openAlexDomains[chosenDomain]} requests ${chosenYear ? `in ${chosenYear}` : ''} (request may have multiple fields)`
        : `Fields of requests ${chosenYear ? `in ${chosenYear}` : ''} (request may have multiple fields)`,
    width: Math.max(width, 600),
    color: {
      ...languageColor,
      legend: true,
      tickFormat: languageName,
    },
    x: { grid: true, label: 'Requests', tickFormat: Math.floor, interval: 1 },
    y: { label: '' },
    marks: [
      Plot.barX(
        chosenField ? requestsBySubfield : requestsByField,
        Plot.groupY(
          {
            x: 'count',
          },
          {
            y: chosenField ? 'subfield' : 'field',
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
    ${resize((width) => requestsByFieldTimeline({width}))}
  </div>
</div>

```js
function requestsByPreprintServer({ width } = {}) {
  return Plot.plot({
    title: chosenField
      ? `${openAlexFields[chosenField].name} requests ${chosenYear ? `in ${chosenYear}` : ''} by preprint server`
      : chosenDomain
        ? `${openAlexDomains[chosenDomain]} requests ${chosenYear ? `in ${chosenYear}` : ''} by preprint server`
        : `Requests ${chosenYear ? `in ${chosenYear}` : ''} by preprint server`,
    width: Math.max(width, 600),
    color: {
      ...languageColor,
      legend: true,
      tickFormat: languageName,
    },
    x: { grid: true, label: 'Requests', tickFormat: Math.floor, interval: 1 },
    y: { label: '' },
    marks: [
      Plot.barX(
        requestsSelected,
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
      Plot.axisY({ lineWidth: 20, marginLeft: 220 }),
    ],
  })
}
```

<div class="grid grid-cols-1">
  <div class="card">
    ${resize((width) => requestsByPreprintServer({width}))}
  </div>
</div>

```js
function requestsByLanguage({ width } = {}) {
  return Plot.plot({
    title: chosenField
      ? `${openAlexFields[chosenField].name} requests ${chosenYear ? `in ${chosenYear}` : ''} by language`
      : chosenDomain
        ? `${openAlexDomains[chosenDomain]} requests ${chosenYear ? `in ${chosenYear}` : ''} by language`
        : `Requests ${chosenYear ? `in ${chosenYear}` : ''} by language`,
    width,
    height: 100,
    color: {
      ...languageColor,
      legend: true,
      tickFormat: languageName,
    },
    x: { label: 'Requests' },
    marks: [
      Plot.barX(
        requestsSelected,
        Plot.groupZ(
          { x: 'count' },
          { fill: 'language', order: languageColor.domain, tip: { format: { fill: languageName } } },
        ),
      ),
    ],
  })
}
```

<div class="grid grid-cols-1">
  <div class="card">
    ${resize((width) => requestsByLanguage({width}))}
  </div>
</div>
