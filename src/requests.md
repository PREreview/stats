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
```

<div class="grid grid-cols-4">
  <div class="card">
    <h2>Requests</h2> 
    <span class="big">${requests.length.toLocaleString("en-US")}</span>
  </div>
</div>

```js
function requestsTimeline({ width } = {}) {
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
    ${resize((width) => requestsTimeline({width}))}
  </div>
</div>
