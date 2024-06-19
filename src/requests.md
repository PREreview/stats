---
theme: dashboard
title: Review requests
toc: false
---

# Review requests 🤞

```js
const requests = FileAttachment('./data/requests.json').json()
```

<div class="grid grid-cols-4">
  <div class="card">
    <h2>Requests</h2> 
    <span class="big">${requests.length.toLocaleString("en-US")}</span>
  </div>
</div>
