# PREreview Stats

The source code for [stats.prereview.org].

## Development

<details>

<summary>Requirements</summary>

- [Docker]
- [GNU Make]
- [Node.js]
- Unix-like operating system

</details>

### Running the app

To build and run the app for development, execute:

```shell
make start
```

You can now access the app at <http://localhost:3000>.

## Operations

Once it passes CI, we deploy every commit on the `main` branch, which [Fly.io] hosts.

[docker]: https://www.docker.com/
[fly.io]: https://fly.io/
[gnu make]: https://www.gnu.org/software/make/
[node.js]: https://nodejs.org/
[stats.prereview.org]: https://stats.prereview.org/
