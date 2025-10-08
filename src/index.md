---
toc: false
---

<div class="hero">
  <h1>PREreview Stats</h1>
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
    <h2>Total users</h2>
    <span class="big">${users.length.toLocaleString("en-US")}</span>
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
  margin: 4rem 0 8rem;
  text-wrap: balance;
  text-align: center;
}

.hero h1 {
  margin: 1rem 0;
  padding: 1rem 0;
  max-width: none;
  font-size: 14vw;
  font-weight: 900;
  line-height: 1;
}

@media (min-width: 640px) {
  .hero h1 {
    font-size: 90px;
  }
}

</style>
