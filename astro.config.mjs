import { defineConfig } from 'astro/config'

export default defineConfig({
  site: 'https://wanderstacks.com',
  build: { format: 'directory' },
  server: { port: 4173 },
  devToolbar: { enabled: false },
})
