---
theme: dashboard
title: PREreviewers
toc: false
---

# PREreviewers 🫅

```js
const parseTimestamp = d3.utcParse('%Y-%m-%dT%H:%M:%SZ')

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
```

<div class="grid grid-cols-4">
  <div class="card">
    <h2>PREreviewers</h2>
    <span class="big">${users.length.toLocaleString("en-US")}</span>
  </div>
</div>

```js
console.log(users)
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
