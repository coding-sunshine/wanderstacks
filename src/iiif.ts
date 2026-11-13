export interface IIIFPage {
  id: string
  service: string
  w: number
  h: number
  label: string
}

const text = (value: unknown, fallback: string): string => {
  if (typeof value === 'string' && value) return value
  if (value && typeof value === 'object') {
    const values = Object.values(value as Record<string, unknown>).flat()
    const first = values.find((v) => typeof v === 'string')
    if (first) return first
  }
  return fallback
}

export function manifestPages(doc: any): IIIFPage[] {
  const canvases = Array.isArray(doc?.items) ? doc.items : doc?.sequences?.[0]?.canvases
  if (!Array.isArray(canvases)) return []
  return canvases.map((canvas: any, index: number): IIIFPage | null => {
    const v3 = canvas?.items?.[0]?.items?.[0]
    const v2 = canvas?.images?.[0]
    const body = v3?.body ?? v2?.resource
    const services = Array.isArray(body?.service) ? body.service : body?.service ? [body.service] : []
    const serviceId = services[0]?.id ?? services[0]?.['@id']
    const id = body?.id ?? body?.['@id']
    const image = serviceId ?? (typeof id === 'string' ? id.split('/full/')[0] : null)
    if (!image || typeof image !== 'string') return null
    return {
      id: canvas.id ?? canvas['@id'] ?? image,
      service: image,
      w: Number(canvas.width ?? body.width ?? 0),
      h: Number(canvas.height ?? body.height ?? 0),
      label: text(canvas.label, `Image ${index + 1}`),
    }
  }).filter((page): page is IIIFPage => !!page && page.w > 0 && page.h > 0)
}

export const iiifImage = (page: IIIFPage, width = 600) => `${page.service}/full/${Math.max(1, Math.min(page.w, Math.round(width)))},/0/default.jpg`
export const manifestTitle = (doc: any, fallback: string) => text(doc?.label, fallback)
