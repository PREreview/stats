---
theme: dashboard
title: PREreviewers
toc: false
---

# PREreviewers 🫅

```js
import countries from 'npm:@geo-maps/countries-land-10km'
import i18nIsoCountries from 'npm:i18n-iso-countries'
```

```js
const parseDate = d3.utcParse('%Y-%m-%d')
const parseTimestamp = d3.utcParse('%Y-%m-%dT%H:%M:%SZ')

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

const careerStage = id => {
  switch (id) {
    case 'early':
      return 'Early'
    case 'mid':
      return 'Mid'
    case 'late':
      return 'Late'
    case undefined:
      return 'Unknown'
    default:
      return id
  }
}

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
const users = FileAttachment('./data/users.json')
  .json()
  .then(data => data.map(user => ({ ...user, timestamp: parseTimestamp(user.timestamp) })))
const reviews = Promise.all([users, FileAttachment('./data/reviews.json').json()]).then(([users, data]) =>
  data.map(review => ({
    ...review,
    createdAt: parseDate(review.createdAt),
    authors: review.authors.map(author => ({
      ...author,
      joined: author.authorType === 'public' ? users.find(user => user.orcid === author.author)?.timestamp : undefined,
    })),
  })),
)
```

```js
const now = new Date()
const firstUser = d3.min(users, user => user.timestamp)
```

```js
const chosenYear = view(
  Inputs.select([null, ..._.range(now.getUTCFullYear(), firstUser.getUTCFullYear() - 1)], {
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
```

```js
const usersInTimePeriod = chosenYear ? users.filter(user => user.timestamp.getUTCFullYear() === chosenYear) : users
const reviewsInTimePeriod = chosenYear
  ? reviews.filter(review => review.createdAt.getUTCFullYear() === chosenYear)
  : reviews

const reviewsSelected = chosenType
  ? reviewsInTimePeriod.filter(review => review.type === chosenType)
  : reviewsInTimePeriod

const userReviews = reviewsSelected.flatMap(({ authors, ...review }) =>
  authors.map(author => ({ ...review, ...author })),
)
const reviewsByAuthor = d3.rollup(
  userReviews,
  d => d.length,
  d => `${d.authorType}:${d.author}`,
)

const reviewsByAuthorInTimePeriod = new Map(
  reviewsByAuthor.entries().filter(([id]) => usersInTimePeriod.some(user => `public:${user.orcid}` === id)),
)

const careerStageColor = Plot.scale({
  color: {
    type: 'categorical',
    domain: ['early', 'mid', 'late'],
    unknown: 'var(--theme-foreground-muted)',
  },
})

const usersWithAtLeast1ReviewPublished = d3.sum(reviewsByAuthor, d => (d[1] >= 1 ? 1 : 0))
const usersWith1ReviewPublished = d3.sum(reviewsByAuthor, d => (d[1] === 1 ? 1 : 0))
const usersWithMoreThan1ReviewsPublished = d3.sum(reviewsByAuthor, d => (d[1] > 1 ? 1 : 0))
const usersWithMoreThan3ReviewsPublished = d3.sum(reviewsByAuthor, d => (d[1] > 3 ? 1 : 0))

const usersInTimePeriodWithAtLeast1ReviewPublished = d3.sum(reviewsByAuthorInTimePeriod, d => (d[1] >= 1 ? 1 : 0))
const usersInTimePeriodWith1ReviewPublished = d3.sum(reviewsByAuthorInTimePeriod, d => (d[1] === 1 ? 1 : 0))
const usersInTimePeriodWithMoreThan1ReviewsPublished = d3.sum(reviewsByAuthorInTimePeriod, d => (d[1] > 1 ? 1 : 0))
const usersInTimePeriodWithMoreThan3ReviewsPublished = d3.sum(reviewsByAuthorInTimePeriod, d => (d[1] > 3 ? 1 : 0))
```

<div class="grid grid-cols-4">
  <div class="card">
    <h2>PREreviewers ${chosenYear ? ` joining in ${chosenYear}` : ''}</h2>
    <span class="big">${usersInTimePeriod.length.toLocaleString("en-US")}</span>
  </div>
  <div class="card">
    <h2>PREreviewer personas with ${chosenType ? reviewType(chosenType) : ''} PREreviews published ${chosenYear ? ` in ${chosenYear}` : ''}</h2>
    <table>
      <colgroup>
        <col>
        <col span="2" style="width: 5em">
      </colgroup>
      <tr class="highlight">
        <th>At least 1</th>
        <td class="numeric">${usersWithAtLeast1ReviewPublished.toLocaleString('en-US')}</td>
        <td></td>
      </tr>
      <tr>
        <th>Only 1</th>
        <td class="numeric">${usersWith1ReviewPublished.toLocaleString('en-US')}</td>
        <td class="numeric">${usersWithAtLeast1ReviewPublished > 0 ? d3.format(".1%")(usersWith1ReviewPublished / usersWithAtLeast1ReviewPublished) : ''}</td>
      </tr>
      <tr>
        <th>More than 1</th>
        <td class="numeric">${usersWithMoreThan1ReviewsPublished.toLocaleString('en-US')}</td>
        <td class="numeric">${usersWithAtLeast1ReviewPublished > 0 ? d3.format(".1%")(usersWithMoreThan1ReviewsPublished / usersWithAtLeast1ReviewPublished) : ''}</td>
      </tr>
      <tr>
        <th>More than 3</th>
        <td class="numeric">${usersWithMoreThan3ReviewsPublished.toLocaleString('en-US')}</td>
        <td class="numeric">${usersWithAtLeast1ReviewPublished > 0 ? d3.format(".1%")(usersWithMoreThan3ReviewsPublished / usersWithAtLeast1ReviewPublished) : ''}</td>
      </tr>
    </table>
  </div>
  <div class="card">
    <h2>PREreviewers ${chosenYear ? ` joining in ${chosenYear}` : ''} with ${chosenType ? reviewType(chosenType) : ''} PREreviews published using their public pseudonym ${chosenYear ? ` in ${chosenYear}` : ''}</h2>
    <table>
      <colgroup>
        <col>
        <col span="2" style="width: 5em">
      </colgroup>
      <tr class="highlight">
        <th>At least 1</th>
        <td class="numeric">${usersInTimePeriodWithAtLeast1ReviewPublished.toLocaleString('en-US')}</td>
        <td class="numeric">${usersInTimePeriod.length > 0 ? d3.format(".1%")(usersInTimePeriodWithAtLeast1ReviewPublished / usersInTimePeriod.length) : ''}</td>
      </tr>
      <tr>
        <th>Only 1</th>
        <td class="numeric">${usersInTimePeriodWith1ReviewPublished.toLocaleString('en-US')}</td>
        <td class="numeric">${usersInTimePeriod.length > 0 ? d3.format(".1%")(usersInTimePeriodWith1ReviewPublished / usersInTimePeriod.length) : ''}</td>
      </tr>
      <tr>
        <th>More than 1</th>
        <td class="numeric">${usersInTimePeriodWithMoreThan1ReviewsPublished.toLocaleString('en-US')}</td>
        <td class="numeric">${usersInTimePeriod.length > 0 ? d3.format(".1%")(usersInTimePeriodWithMoreThan1ReviewsPublished / usersInTimePeriod.length) : ''}</td>
      </tr>
      <tr>
        <th>More than 3</th>
        <td class="numeric">${usersInTimePeriodWithMoreThan3ReviewsPublished.toLocaleString('en-US')}</td>
        <td class="numeric">${usersInTimePeriod.length > 0 ? d3.format(".1%")(usersInTimePeriodWithMoreThan3ReviewsPublished / usersInTimePeriod.length) : ''}</td>
      </tr>
    </table>
  </div>
</div>

```js
function mostAuthored({ width } = {}) {
  return Plot.plot({
    title: `PREreviewer personas by number of ${chosenType ? reviewType(chosenType) : ''} PREreviews${chosenYear ? ` published in ${chosenYear}` : ''}`,
    width: Math.max(width, 600),
    height: 500,
    marginBottom: 150,
    y: { grid: true, label: 'PREreviews', tickFormat: Math.floor, interval: 1 },
    x: { label: 'PREreviewer', tickRotate: -90 },
    marks: [
      Plot.rectY(userReviews, Plot.groupX({ y: 'count' }, { x: 'author', y: 'x', sort: { x: '-y', limit: 25 } })),
    ],
  })
}
```

<div class="grid grid-cols-1">
  <div class="card">
    ${resize((width) => mostAuthored({width}))}
  </div>
</div>

```js
function usersTimeline({ width } = {}) {
  return Plot.plot({
    title: `PREreviewers joining ${chosenYear ? `in ${chosenYear} per week` : 'per month'}`,
    width: Math.max(width, 600),
    height: 400,
    y: { grid: true, label: 'PREreviewers', tickFormat: Math.floor, interval: 1 },
    x: {
      label: '',
      domain: chosenYear
        ? [
            d3.utcSunday.floor(new Date(chosenYear, 0, 1, 0, 0, 0, 0)),
            d3.utcSunday.ceil(new Date(chosenYear + 1, 0, 1, 0, 0, 0, 0)),
          ]
        : [d3.utcMonth.floor(firstUser), d3.utcMonth.ceil(now)],
    },
    marks: [
      Plot.rectY(
        usersInTimePeriod,
        Plot.binX(
          { y: 'count' },
          {
            x: 'timestamp',
            interval: chosenYear ? d3.utcWeek : d3.utcMonth,
            tip: true,
          },
        ),
      ),
    ],
  })
}
```

<div class="grid grid-cols-1">
  <div class="card">
    ${resize((width) => usersTimeline({width}))}
  </div>
</div>

```js
function usersByCareerStage({ width } = {}) {
  return Plot.plot({
    title: `PREreviewers ${chosenYear ? `joining in ${chosenYear}` : ''} by career stage`,
    width,
    height: 100,
    color: {
      ...careerStageColor,
      legend: true,
      tickFormat: careerStage,
    },
    x: { label: 'PREreviewers' },
    marks: [
      Plot.barX(
        usersInTimePeriod,
        Plot.groupZ(
          { x: 'count' },
          { fill: 'careerStage', order: careerStageColor.domain, tip: { format: { fill: careerStage } } },
        ),
      ),
    ],
  })
}
```

<div class="grid grid-cols-1">
  <div class="card">
    ${resize((width) => usersByCareerStage({width}))}
  </div>
</div>

```js
function usersByLocation() {
  const colors = d3.rollup(
    usersInTimePeriod.filter(user => user.country),
    users => users.length,
    user => user.country,
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
      label: 'PREreviewers',
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
    <h2>${`PREreviewers ${chosenYear ? `joining in ${chosenYear}` : ''} locations`}</h2>
    <div class="muted">Location available for ${d3.format(".1%")(usersInTimePeriod.filter(user => user.country).length/ usersInTimePeriod.length)} of PREreviewers ${chosenYear ? `joining in ${chosenYear}` : ''}</div>
    ${usersByLocation()}
  </div>
</div>

<style>

tr.highlight {
  border-color: currentColor;
}

td.numeric {
  text-align: right;
  font-variant-numeric: tabular-nums;
}

</style>
