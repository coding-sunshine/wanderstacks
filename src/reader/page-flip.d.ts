declare module 'page-flip' {
  export interface FlipSettings {
    width: number
    height: number
    size: 'fixed' | 'stretch'
    usePortrait: boolean
    showCover: boolean
    useMouseEvents: boolean
    mobileScrollSupport: boolean
    flippingTime: number
    drawShadow: boolean
    maxShadowOpacity: number
    startPage: number
    autoSize: boolean
  }
  export class PageFlip {
    constructor(block: HTMLElement, setting: Partial<FlipSettings>)
    loadFromHTML(items: HTMLElement[]): void
    updateFromHtml(items: HTMLElement[]): void
    turnToPage(page: number): void
    flipNext(): void
    flipPrev(): void
    getCurrentPageIndex(): number
    getPageCount(): number
    on(event: 'flip' | 'update' | 'init', cb: (e: { data: unknown }) => void): this
    destroy(): void
  }
}
