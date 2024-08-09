import {
  type Fixtures,
  type PlaywrightTestArgs,
  type PlaywrightTestOptions,
  test as baseTest,
  expect,
} from '@playwright/test'

export { expect } from '@playwright/test'

const appFixtures: Fixtures<Record<never, never>, Record<never, never>, PlaywrightTestArgs & PlaywrightTestOptions> = {
  baseURL: async ({}, use) => {
    await use('http://localhost:3000')
  },
  context: async ({ context }, use) => {
    const errors: Array<string> = []

    context.on('weberror', error => {
      errors.push(error.error().message)
    })

    await use(context)

    expect(errors).toHaveLength(0)
  },
}

export const test = baseTest.extend(appFixtures)
