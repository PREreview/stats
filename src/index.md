---
toc: false
---

<div class="hero">
  <h1>PREreview Stats</h1>

  <p>
    Welcome to PREreview’s public stats dashboard! We’ve gathered together some aggregate,
    anonymized data here to celebrate our community members’ contributions to open peer review
    and to demonstrate PREreview’s growth and impact over time. Please let us know if you have
    any questions by writing us at <a href="mailto:help@prereview.org">help@prereview.org</a>.
  </p>
</div>

```js
const requests = FileAttachment('./data/requests.json').json()
const reviews = FileAttachment('./data/reviews.json').json()
const users = FileAttachment('./data/users.json').json()
const clubs = FileAttachment('./data/clubs.json').json()
```

<div class="grid grid-cols-4">
  <div class="card">
    <h2>Total PREreviews</h2>
    <span class="big">${reviews.length.toLocaleString("en-US")}</span>
    <div>${reviews.filter(review => review.live).length.toLocaleString("en-US")} Live Reviews</div>
  </div>

  <div class="card">
    <h2>Total requests</h2>
    <span class="big">${requests.length.toLocaleString("en-US")}</span>
  </div>

  <div class="card">
    <h2>Total PREreviewers</h2>
    <span class="big">${users.count.toLocaleString("en-US")}</span>
  </div>

  <div class="card">
    <h2>Total clubs</h2>
    <span class="big">${Object.keys(clubs).length.toLocaleString("en-US")}</span>
  </div>
</div>

<style>

.hero {
  display: flex;
  flex-direction: column;
  align-items: center;
  font-family: var(--sans-serif);
  margin: 0 0 1rem;
  text-wrap: balance;
  text-align: center;
}

.hero h1 {
  margin: 0;
  padding: 1rem 0;
  max-width: none;
  font-size: 14vw;
  font-weight: 900;
  line-height: 1;
}

.hero p {
  text-align: left;
  text-wrap-style: pretty;
}

@media (min-width: 640px) {
  .hero {
    margin: 4rem 0 6rem;
  }

  .hero h1 {
    margin: 1rem 0;
    font-size: 90px;
  }
}

</style>
