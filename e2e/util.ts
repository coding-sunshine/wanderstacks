import type { Page } from '@playwright/test'
import { origin } from '../playwright.config'

export function watchErrors(page: Page) {
  const errors: string[] = []
  page.on('console', (m) => m.type() === 'error' && errors.push(`console: ${m.text()}`))
  page.on('pageerror', (e) => errors.push(`pageerror: ${e.message}`))
  page.on('requestfailed', (r) => r.url().startsWith(origin) && errors.push(`failed: ${r.url()} ${r.failure()?.errorText}`))
  page.on('response', (r) => {
    const u = r.url()
    if (u.startsWith('http://') && !u.startsWith(origin)) errors.push(`mixed: ${u}`)
    if (u.startsWith(origin) && r.status() >= 400) errors.push(`${r.status()}: ${u}`)
  })
  return errors
}
