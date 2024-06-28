---
theme: dashboard
title: Review requests
toc: false
---

# Review requests 🤞

```js
const parseTimestamp = d3.utcParse('%Y-%m-%dT%H:%M:%S.%LZ')
const languageNames = new Intl.DisplayNames(['en-US'], { type: 'language' })
const languageName = code => (code ? languageNames.of(code) : 'Not yet detected')

const requests = FileAttachment('./data/requests.json')
  .json()
  .then(data => data.map(request => ({ ...request, timestamp: parseTimestamp(request.timestamp) })))

const openAlexDomains = FileAttachment('./data/openalex-domains.json').json()
const openAlexFields = FileAttachment('./data/openalex-fields.json').json()
```

```js
const now = new Date()
const firstRequest = d3.min(requests, request => request.timestamp)
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
const requestsSelected = chosenDomain ? requests.filter(d => d.domains.includes(chosenDomain)) : requests
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

const requestsByField = requestsSelected
  .flatMap(({ fields, ...request }) => fields.map(field => ({ ...request, field })))
  .filter(request => (chosenDomain ? openAlexFields[request.field].domain === chosenDomain : true))
  .map(({ field, ...request }) => ({ ...request, field: openAlexFields[field].name }))
```

<div class="grid grid-cols-4">
  <div class="card">
    <h2>${chosenDomain ? `${openAlexDomains[chosenDomain]} requests` : 'Requests'}</h2> 
    <span class="big">${requestsSelected.length.toLocaleString("en-US")}</span>
    ${chosenDomain ? html`
      <div>${d3.format(".1%")(requestsSelected.length / requests.length)} of all requests</div>
    ` : ''}
  </div>
</div>

```js
function requestsByLanguageTimeline({ width } = {}) {
  return Plot.plot({
    title: chosenDomain ? `${openAlexDomains[chosenDomain]} requests per week` : 'Requests per week',
    width: Math.max(width, 600),
    height: 400,
    color: {
      ...languageColor,
      legend: true,
      tickFormat: languageName,
    },
    y: { grid: true, label: 'Requests', tickFormat: Math.floor, interval: 1 },
    x: { label: '', domain: [d3.utcSunday.floor(firstRequest), d3.utcSunday.ceil(now)] },
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
    title: chosenDomain
      ? `Fields of ${openAlexDomains[chosenDomain]} requests (request may have multiple fields)`
      : 'Fields of requests (request may have multiple fields)',
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
        requestsByField,
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
    ${resize((width) => requestsByFieldTimeline({width}))}
  </div>
</div>
