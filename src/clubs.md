---
theme: dashboard
title: Clubs
toc: false
---

# Clubs ♣️

```js
const allClubs = FileAttachment('./data/clubs.json')
  .json()
  .then(data => Object.entries(data).map(([id, name]) => ({ id, name })))
const allReviews = FileAttachment('./data/reviews.json').json()
```

```js
const numberOfReviewsByClub = d3.rollup(
  allReviews,
  d => d.length,
  d => d.club,
)
```

```js
const clubs = Inputs.table(
  allClubs.map(club => ({ ...club, reviews: numberOfReviewsByClub.get(club.id) })),
  {
    columns: ['name', 'reviews'],
    header: { name: 'Name', reviews: 'Number of PREreviews' },
    select: false,
    sort: 'name',
    rows: 30,
  },
)
```

<div class="grid grid-cols-1">
  <div class="card">
    ${clubs}
  </div>
</div>
