import { defineConfig, devices } from '@playwright/test'

export default defineConfig({
  fullyParallel: true,
  outputDir: 'integration-results',
  preserveOutput: 'failures-only',
  projects: [
    {
      name: 'Desktop Chrome',
      use: devices['Desktop Chrome'],
    },
  ],
  testDir: 'integration',
  webServer: {
    command: 'npx serve dist',
    url: 'http://127.0.0.1:3000',
  },
})
