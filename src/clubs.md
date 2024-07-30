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
```

```js
const clubs = Inputs.table(allClubs, {
  columns: ['name'],
  header: { name: 'Name' },
  sort: 'name',
  required: false,
  rows: 30,
})
```

<div class="grid grid-cols-1">
  <div class="card">
    ${clubs}
  </div>
</div>
