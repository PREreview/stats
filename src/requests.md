---
theme: dashboard
title: Review requests
toc: false
---

# Review requests 🤞

```js
const parseTimestamp = d3.utcParse('%Y-%m-%dT%H:%M:%S.%LZ')
const languageNames = new Intl.DisplayNames(['en-US'], { type: 'language' })

const requests = FileAttachment('./data/requests.json')
  .json()
  .then(data => data.map(request => ({ ...request, timestamp: parseTimestamp(request.timestamp) })))

const openAlexFields = FileAttachment('./data/openalex-fields.json')
  .json()
```

```js
const requestsByField = requests.flatMap(({ fields, ...request }) => fields.map(field => ({ ...request, field })))
```

<div class="grid grid-cols-4">
  <div class="card">
    <h2>Requests</h2> 
    <span class="big">${requests.length.toLocaleString("en-US")}</span>
  </div>
</div>

```js
function requestsByLanguageTimeline({ width } = {}) {
  return Plot.plot({
    title: 'Requests per week',
    width: Math.max(width, 600),
    height: 400,
    color: {
      legend: true,
      tickFormat: d => (d ? languageNames.of(d) : 'Not yet detected'),
    },
    y: { grid: true, label: 'Requests' },
    x: { label: '' },
    marks: [
      Plot.rectY(
        requests,
        Plot.binX(
          { y: 'count' },
          {
            x: 'timestamp',
            interval: d3.utcWeek,
            fill: 'language',
            order: ['en', 'es', 'pt'],
            tip: true,
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
    title: 'Requests per week',
    width: Math.max(width, 600),
    height: 400,
    color: {
      legend: true,
      type: 'ordinal',
    },
    y: { grid: true, label: 'Requests' },
    x: { label: '' },
    marks: [
      Plot.rectY(
        requestsByField,
        Plot.binX(
          { y: 'count' },
          {
            x: 'timestamp',
            interval: d3.utcWeek,
            fill: 'field',
            tip: true,
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
    ${resize((width) => requestsByFieldTimeline({width}))}
  </div>
</div>
