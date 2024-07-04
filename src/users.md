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
    title: 'PREreviewers joining per month',
    width: Math.max(width, 600),
    height: 400,
    y: { grid: true, label: 'PREreviewers', tickFormat: Math.floor, interval: 1 },
    x: {
      label: '',
      domain: [d3.utcMonth.floor(firstUser), d3.utcMonth.ceil(now)],
    },
    marks: [
      Plot.rectY(
        users,
        Plot.binX(
          { y: 'count' },
          {
            x: 'timestamp',
            interval: d3.utcMonth,
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
