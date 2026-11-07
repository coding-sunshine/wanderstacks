import type { Page } from '@playwright/test'
import { readFileSync } from 'node:fs'
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

export const ready = (page: Page, view: string) =>
  page.locator(`[data-view="${view}"][data-ready="true"]`).waitFor({ timeout: 30_000 })

type Row = { id: string; lib: string | null; tier?: string }

export const readableIds = () => {
  const { books } = JSON.parse(readFileSync(new URL('../data/books.json', import.meta.url), 'utf8')) as { books: Row[] }
  return books.filter((b) => b.lib === 'longroom' && b.tier === 'readable-text').map((b) => b.id)
}

export const roomIds = () => ['longroom', 'admont', 'strahov', 'loc', 'celsus'] as const
