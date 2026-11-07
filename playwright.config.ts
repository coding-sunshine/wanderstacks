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
    command: `bunx vite preview --port ${new URL(origin).port} --strictPort`,
    url: origin,
    reuseExistingServer: true,
    timeout: 30_000,
  },
})
