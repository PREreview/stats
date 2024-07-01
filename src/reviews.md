---
theme: dashboard
title: PREreviews
toc: false
---

# PREreviews ✍️

```js
const reviews = FileAttachment('./data/reviews.json').json()
```

<div class="grid grid-cols-4">
  <div class="card">
    <h2>PREreviews</h2>
    <span class="big">${reviews.length.toLocaleString("en-US")}</span>
  </div>
</div>
