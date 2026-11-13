import { describe, expect, test } from 'bun:test'
import { iiifImage, manifestPages } from './iiif'

describe('IIIF reading desk', () => {
  test('reads v3 image services and never upscales', () => {
    const pages = manifestPages({
      items: [{
        id: 'canvas/1', width: 527, height: 900, label: { en: ['First'] },
        items: [{ items: [{ body: { id: 'image/1', service: [{ id: 'iiif/1', type: 'ImageService3' }] } }] }],
      }],
    })
    expect(pages).toHaveLength(1)
    expect(iiifImage(pages[0]!, 1000)).toBe('iiif/1/full/527,/0/default.jpg')
  })

  test('reads a v2 service published as an object', () => {
    const pages = manifestPages({
      sequences: [{
        canvases: [{
          '@id': 'canvas/1', width: 1425, height: 1999, label: 'Cover',
          images: [{ resource: {
            '@id': 'resource/1', width: 1425, height: 1999,
            service: { '@id': 'iiif/image/1', profile: 'http://iiif.io/api/image/2/level2.json' },
          } }],
        }],
      }],
    })
    expect(pages).toHaveLength(1)
    expect(iiifImage(pages[0]!, 600)).toBe('iiif/image/1/full/600,/0/default.jpg')
  })

  test('rejects manifests without readable image dimensions', () => {
    expect(manifestPages({ items: [{ width: 0, height: 0 }] })).toEqual([])
  })
})
