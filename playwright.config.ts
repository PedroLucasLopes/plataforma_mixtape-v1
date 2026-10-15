import { defineConfig, devices } from '@playwright/test'
import { E2E } from './e2e/support/constants'

export default defineConfig({
  testDir: 'e2e',
  outputDir: 'test-results',
  timeout: E2E.testTimeout,
  expect: { timeout: E2E.expectTimeout },
  fullyParallel: false,
  workers: 1,
  forbidOnly: Boolean(process.env.CI),
  retries: process.env.CI ? 1 : 0,
  reporter: [['list'], ['html', { open: 'never', outputFolder: 'playwright-report' }]],
  use: {
    baseURL: E2E.baseUrl,
    locale: 'pt-BR',
    timezoneId: 'America/Sao_Paulo',
    trace: 'retain-on-failure',
    screenshot: 'only-on-failure',
  },
  projects: [
    { name: 'setup', testMatch: /.*\.setup\.ts/, use: { ...devices['Desktop Chrome'], channel: E2E.channel } },
    {
      name: 'desktop',
      dependencies: ['setup'],
      testMatch: /.*\.spec\.ts/,
      use: { ...devices['Desktop Chrome'], channel: E2E.channel },
    },
    {
      name: 'mobile',
      dependencies: ['setup'],
      testMatch: /(smoke|charts)\.spec\.ts/,
      use: { ...devices['Pixel 7'], channel: E2E.channel },
    },
  ],
})
