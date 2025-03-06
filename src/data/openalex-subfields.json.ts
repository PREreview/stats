import { HttpClient, HttpClientResponse, Terminal } from '@effect/platform'
import { NodeHttpClient, NodeTerminal } from '@effect/platform-node'
import { Effect, flow, Record, Schema, Stream } from 'effect'
import { FieldIdFromUrlSchema, FieldIdSchema, SubfieldIdFromUrlSchema, SubfieldIdSchema } from '../lib/OpenAlex.js'
import { UrlFromStringSchema } from '../lib/Url.js'

const Subfields = Schema.Struct({
  meta: Schema.Struct({ next_cursor: Schema.optionalWith(Schema.String, { as: 'Option', nullable: true }) }),
  results: Schema.Chunk(
    Schema.Struct({
      id: Schema.compose(UrlFromStringSchema, SubfieldIdFromUrlSchema),
      display_name: Schema.String,
      field: Schema.Struct({
        id: Schema.compose(UrlFromStringSchema, FieldIdFromUrlSchema),
      }),
    }),
  ),
})

const SubfieldNames = Schema.Record({
  key: SubfieldIdSchema,
  value: Schema.Struct({ name: Schema.String, field: FieldIdSchema }),
})

const program = Effect.gen(function* () {
  const terminal = yield* Terminal.Terminal

  const data = yield* Stream.paginateChunkEffect(
    '*',
    flow(
      cursor => HttpClient.get('https://api.openalex.org/subfields', { urlParams: { 'per-page': 100, cursor } }),
      Effect.andThen(HttpClientResponse.schemaBodyJson(Subfields)),
      Effect.scoped,
      Effect.andThen(response => [response.results, response.meta.next_cursor]),
    ),
  ).pipe(Stream.runCollect)

  const transformedData = Record.fromIterableWith(data, subfield => [
    subfield.id,
    { name: subfield.display_name, field: subfield.field.id },
  ])

  const encoded = yield* Schema.encode(Schema.parseJson(SubfieldNames))(transformedData)

  yield* terminal.display(encoded)
})

await Effect.runPromise(program.pipe(Effect.provide(NodeHttpClient.layer), Effect.provide(NodeTerminal.layer)))
