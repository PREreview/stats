---
title: Website
toc: false
---

# Website 🌐

```js
import countries from 'npm:@geo-maps/countries-land-10km'
import i18nIsoCountries from 'npm:i18n-iso-countries'
```

```js
const parseYearMonth = d3.utcParse('%Y-%m')

const regionNames = new Intl.DisplayNames(['en-US'], { type: 'region' })
const regionName = code => regionNames.of(code)

const getFlagEmoji = code =>
  String.fromCodePoint(
    ...code
      .toUpperCase()
      .split('')
      .map(char => 127397 + char.charCodeAt()),
  )

const regionNameWithFlag = code => `${getFlagEmoji(code)} ${regionName(code)}`

const visitorsByCountry = FileAttachment('./data/visitors-by-country.json')
  .json()
  .then(data => data.map(visitor => ({ ...visitor, date: parseYearMonth(visitor.yearMonth) })))
const allVisitorsByReferrer = FileAttachment('./data/visitors-by-referrer.json')
  .json()
  .then(data => data.map(visitor => ({ ...visitor, date: parseYearMonth(visitor.yearMonth) })))
```

```js
const now = new Date()
const firstVisitor = d3.min(visitorsByCountry, user => user.date)
```

```js
const chosenYear = view(
  Inputs.select([null, ..._.range(now.getUTCFullYear(), firstVisitor.getUTCFullYear() - 1)], {
    label: 'Year',
    format: year => year ?? 'All-time',
  }),
)
```

```js
const visitorsByCountryInTimePeriod = chosenYear
  ? visitorsByCountry.filter(visitors => visitors.date.getUTCFullYear() === chosenYear)
  : visitorsByCountry

const allVisitorsByReferrerInTimePeriod = chosenYear
  ? allVisitorsByReferrer.filter(visitors => visitors.date.getUTCFullYear() === chosenYear)
  : allVisitorsByReferrer
```

```js
function visitorsByLocation() {
  const colors = d3.rollup(
    visitorsByCountryInTimePeriod.filter(visitors => visitors.country),
    visitors => d3.sum(visitors, visitor => visitor.number),
    visitors => visitors.country,
  )
  return Plot.plot({
    projection: 'equal-earth',
    width,
    height: d3.min([700, width / 2]),
    color: {
      scheme: 'reds',
      domain: [0, d3.max(colors.values())],
      unknown: 'var(--theme-background-alt)',
      type: 'linear',
      label: 'Visitors',
      legend: true,
    },
    marks: [
      Plot.geo(
        countries(),
        Plot.centroid({
          fill: d => colors.get(i18nIsoCountries.alpha3ToAlpha2(d.properties.A3)),
          stroke: 'var(--theme-foreground-muted)',
          strokeWidth: 0.2,
          tip: true,
          title: d => {
            const alpha2 = i18nIsoCountries.alpha3ToAlpha2(d.properties.A3)
            return `${alpha2 ? regionNameWithFlag(alpha2) : d.properties.A3} ${(colors.get(alpha2) ?? 0).toLocaleString('en-US')}`
          },
        }),
      ),
    ],
  })
}
```

<div class="grid grid-cols-1">
  <div class="card">
    <h2>Visitors ${chosenYear ? ` in ${chosenYear}` : ''}</h2>
    ${visitorsByLocation()}
  </div>
</div>

```js
const visitorsByReferrer = Inputs.table(
  d3.map(
    d3.rollup(
      allVisitorsByReferrerInTimePeriod,
      visitors => d3.sum(visitors, visitor => visitor.number),
      visitors => visitors.referrer,
    ),
    ([referrer, number]) => ({ referrer: referrer ?? 'Direct or unknown', number }),
  ),
  {
    header: {
      referrer: 'Referrer',
      number: 'Number',
    },
    select: false,
    sort: 'number',
    reverse: true,
    rows: 20,
  },
)
```

<div class="grid grid-cols-1">
  <div class="card">
    <h2>Visitors ${chosenYear ? ` in ${chosenYear}` : ''}</h2>
    ${visitorsByReferrer}
  </div>
</div>
