---
theme: dashboard
title: PREreviews
toc: false
---

# PREreviews ✍️

```js
const parseDate = d3.utcParse('%Y-%m-%d')

const reviews = FileAttachment('./data/reviews.json')
  .json()
  .then(data => data.map(review => ({ ...review, createdAt: parseDate(review.createdAt) })))
```

```js
const now = new Date()
const firstReview = d3.min(reviews, review => review.createdAt)
```

```js
const chosenYear = view(
  Inputs.select([null, ..._.range(now.getUTCFullYear(), firstReview.getUTCFullYear() - 1)], {
    label: 'Year',
    format: year => year ?? 'All-time',
  }),
)
```

```js
const reviewsSelected = chosenYear
  ? reviews.filter(review => review.createdAt.getUTCFullYear() === chosenYear)
  : reviews
```

<div class="grid grid-cols-4">
  <div class="card">
    <h2>PREreviews ${chosenYear ? ` in ${chosenYear}` : ''}</h2>
    <span class="big">${reviewsSelected.length.toLocaleString("en-US")}</span>
  </div>
</div>

```js
function reviewsTimeline({ width } = {}) {
  return Plot.plot({
    title: 'PREreviews per month',
    width: Math.max(width, 600),
    height: 400,
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
    ${resize((width) => reviewsTimeline({width}))}
  </div>
</div>
