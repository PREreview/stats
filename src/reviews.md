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

<div class="grid grid-cols-4">
  <div class="card">
    <h2>PREreviews</h2>
    <span class="big">${reviews.length.toLocaleString("en-US")}</span>
  </div>
</div>

```js
function reviewsTimeline({ width } = {}) {
  return Plot.plot({
    title: 'PREreviews per month',
    width: Math.max(width, 600),
    height: 400,
    y: { grid: true, label: 'PREreviews', tickFormat: Math.floor, interval: 1 },
    x: { label: '', domain: [d3.utcMonth.floor(firstReview), d3.utcMonth.ceil(now)] },
    marks: [
      Plot.rectY(
        reviews,
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
