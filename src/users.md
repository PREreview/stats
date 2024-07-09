---
theme: dashboard
title: PREreviewers
toc: false
---

# PREreviewers 🫅

```js
const parseTimestamp = d3.utcParse('%Y-%m-%dT%H:%M:%SZ')

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

const users = FileAttachment('./data/users.json')
  .json()
  .then(data => data.map(user => ({ ...user, timestamp: parseTimestamp(user.timestamp) })))
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
```

```js
const usersInTimePeriod = chosenYear ? users.filter(user => user.timestamp.getUTCFullYear() === chosenYear) : users

const careerStageColor = Plot.scale({
  color: {
    type: 'categorical',
    domain: ['early', 'mid', 'late'],
    unknown: 'var(--theme-foreground-muted)',
  },
})
```

<div class="grid grid-cols-4">
  <div class="card">
    <h2>PREreviewers ${chosenYear ? ` joining in ${chosenYear}` : ''}</h2>
    <span class="big">${usersInTimePeriod.length.toLocaleString("en-US")}</span>
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
        : [d3.utcSunday.floor(firstUser), d3.utcSunday.ceil(now)],
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
