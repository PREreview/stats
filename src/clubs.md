---
theme: dashboard
title: Clubs
toc: false
---

# Clubs ♣️

```js
const parseDate = d3.utcParse('%Y-%m-%d')

const allClubs = FileAttachment('./data/clubs.json')
  .json()
  .then(data => Object.entries(data).map(([id, club]) => ({ id, ...club, added: parseDate(club.added) })))
const allReviews = FileAttachment('./data/reviews.json')
  .json()
  .then(data => data.map(review => ({ ...review, createdAt: parseDate(review.createdAt) })))
```

```js
const now = new Date()
const firstReview = d3.min(allReviews, review => review.createdAt)
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
const reviewsInTimePeriod = chosenYear
  ? allReviews.filter(review => review.createdAt.getUTCFullYear() === chosenYear)
  : allReviews

const clubReviewsInTimePeriod = reviewsInTimePeriod.filter(review => review.club)
```

```js
const numberOfReviewsByClub = d3.rollup(
  reviewsInTimePeriod,
  d => d.length,
  d => d.club,
)
```

<div class="grid grid-cols-4">
  <div class="card">
    <h2>Total clubs</h2>
    <span class="big">${Object.keys(allClubs).length.toLocaleString("en-US")}</span>
  </div>

  <div class="card">
    <h2>PREreviews published by clubs${chosenYear ? ` in ${chosenYear}` : ''}</h2>
    <span class="big">${clubReviewsInTimePeriod.length.toLocaleString("en-US")}</span>
    <div>${d3.format(".1%")(clubReviewsInTimePeriod.length / reviewsInTimePeriod.length)} of all PREreviews</div>
  </div>
</div>

```js
const clubs = Inputs.table(
  allClubs.map(club => ({
    ...club,
    sortName: club.name.toLocaleLowerCase(),
    reviews: numberOfReviewsByClub.get(club.id),
  })),
  {
    columns: ['sortName', 'added', 'reviews'],
    header: {
      sortName: 'Name',
      added: 'Added',
      reviews: `Number of PREreviews${chosenYear ? ` in ${chosenYear}` : ''}`,
    },
    format: {
      sortName: (_sortName, index, clubs) => clubs[index].name,
    },
    select: false,
    sort: 'sortName',
    rows: 30,
  },
)
```

<div class="grid grid-cols-1">
  <div class="card">
    ${clubs}
  </div>
</div>
