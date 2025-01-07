import { FileSystem, HttpClient, HttpClientRequest, HttpClientResponse, Terminal } from '@effect/platform'
import { NodeFileSystem, NodeHttpClient, NodeTerminal } from '@effect/platform-node'
import { Array, Config, Effect, Option, Redacted, Schema } from 'effect'
import * as Doi from '../lib/Doi.js'
import * as LanguageCode from '../lib/LanguageCode.js'
import * as OrcidId from '../lib/OrcidId.js'
import * as PreprintServer from '../lib/PreprintServer.js'
import * as Temporal from '../lib/Temporal.js'

const Reviews = Schema.Array(
  Schema.Struct({
    authors: Schema.Array(
      Schema.Union(
        Schema.Struct({
          authorType: Schema.Literal('public'),
          author: OrcidId.OrcidIdSchema,
        }),
        Schema.Struct({
          authorType: Schema.Literal('pseudonym'),
          author: Schema.String,
        }),
      ),
    ),
    club: Schema.OptionFromUndefinedOr(Schema.String),
    createdAt: Temporal.PlainDateFromStringSchema,
    preprint: Doi.ParseDoiSchema,
    language: Schema.OptionFromUndefinedOr(LanguageCode.LanguageCodeSchema),
    live: Schema.Boolean,
    requested: Schema.Boolean,
    server: PreprintServer.PreprintServerSchema,
    type: Schema.Literal('full', 'structured', 'rapid'),
  }),
)

const LegacyReviews = Schema.Array(
  Schema.Struct({
    createdAt: Temporal.InstantFromStringSchema,
    authors: Schema.Array(
      Schema.Union(
        Schema.Struct({
          isAnonymous: Schema.Literal(false),
          orcid: OrcidId.OrcidIdSchema,
        }),
        Schema.Struct({
          isAnonymous: Schema.Literal(true),
          name: Schema.String,
        }),
      ),
    ),
    preprint: Schema.Struct({
      handle: Doi.ParseDoiSchema,
      preprintServer: PreprintServer.PreprintServerSchema,
    }),
  }),
)

const LegacyRapidReviews = Schema.Struct({
  data: Schema.Array(
    Schema.Struct({
      createdAt: Temporal.InstantFromStringSchema,
      author: Schema.Union(
        Schema.Struct({
          isAnonymous: Schema.Literal(false),
          orcid: OrcidId.OrcidIdSchema,
        }),
        Schema.Struct({
          isAnonymous: Schema.Literal(true),
          name: Schema.String,
        }),
      ),
      preprint: Schema.Struct({
        handle: Doi.ParseDoiSchema,
        preprintServer: PreprintServer.PreprintServerSchema,
      }),
    }),
  ),
})

const getLegacyRapidReviews = Effect.gen(function* () {
  const fs = yield* FileSystem.FileSystem

  const file = yield* fs.readFileString('src/data/legacy/rapid-reviews.json')
  const data = yield* Schema.decodeUnknown(Schema.parseJson(LegacyRapidReviews))(file)

  return Array.map(
    data.data,
    review =>
      ({
        authors: [
          review.author.isAnonymous
            ? { author: review.author.name, authorType: 'pseudonym' }
            : { author: review.author.orcid, authorType: 'public' },
        ],
        club: Option.none(),
        createdAt: review.createdAt.toZonedDateTimeISO('UTC').toPlainDate(),
        language: Option.some('en'),
        live: false,
        preprint: review.preprint.handle,
        requested: false,
        server: review.preprint.preprintServer,
        type: 'rapid',
      }) satisfies Schema.Schema.Type<typeof Reviews>[number],
  )
})

const getLegacyReviews = Effect.gen(function* () {
  const fs = yield* FileSystem.FileSystem

  const file = yield* fs.readFileString('src/data/legacy/reviews.json')
  const data = yield* Schema.decodeUnknown(Schema.parseJson(LegacyReviews))(file)

  return Array.map(
    data,
    review =>
      ({
        authors: Array.map(review.authors, author =>
          author.isAnonymous
            ? { author: author.name, authorType: 'pseudonym' }
            : { author: author.orcid, authorType: 'public' },
        ),
        club: Option.none(),
        createdAt: review.createdAt.toZonedDateTimeISO('UTC').toPlainDate(),
        language: Option.some('en'),
        live: false,
        preprint: review.preprint.handle,
        requested: false,
        server: review.preprint.preprintServer,
        type: 'full',
      }) satisfies Schema.Schema.Type<typeof Reviews>[number],
  )
})

const getReviews = Effect.gen(function* () {
  const client = yield* HttpClient.HttpClient
  const sandbox = yield* Config.withDefault(Config.boolean('SANDBOX'), false)

  if (sandbox) {
    return []
  }

  const token = yield* Config.redacted('PREREVIEW_REVIEWS_DATA_TOKEN')

  const request = HttpClientRequest.bearerToken(
    HttpClientRequest.get('https://prereview.org/reviews-data'),
    Redacted.value(token),
  )

  return yield* client.execute(request).pipe(Effect.andThen(HttpClientResponse.schemaBodyJson(Reviews)), Effect.scoped)
})

const program = Effect.gen(function* () {
  const terminal = yield* Terminal.Terminal

  const data = yield* Effect.map(Effect.all([getReviews, getLegacyReviews, getLegacyRapidReviews]), Array.flatten)

  const encoded = yield* Schema.encode(Schema.parseJson(Reviews))(data)

  yield* terminal.display(encoded)
})

await Effect.runPromise(
  program.pipe(
    Effect.provide(NodeHttpClient.layer),
    Effect.provide(NodeTerminal.layer),
    Effect.provide(NodeFileSystem.layer),
  ),
)
