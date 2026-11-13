import { defineConfig, devices } from '@playwright/test'

export const origin = `http://localhost:${process.env.PORT ?? 4173}`

export default defineConfig({
  testDir: 'e2e',
  timeout: 60_000,
  fullyParallel: false,
  workers: 1,
  reporter: 'list',
  use: { baseURL: origin, ...devices['Desktop Chrome'], channel: 'chrome' },
  webServer: {
    command: `bun run preview -- --host 127.0.0.1 --port ${new URL(origin).port} --ignore-lock`,
    url: origin,
    reuseExistingServer: true,
    timeout: 30_000,
  },
})
