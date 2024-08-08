import { type Fixtures, type PlaywrightTestArgs, type PlaywrightTestOptions, test as baseTest } from '@playwright/test'

export { expect } from '@playwright/test'

const appFixtures: Fixtures<Record<never, never>, Record<never, never>, PlaywrightTestArgs & PlaywrightTestOptions> = {
  baseURL: async ({}, use) => {
    await use('http://localhost:3000')
  },
}

export const test = baseTest.extend(appFixtures)
