import { getCardFootprint } from '@/composables/print/cardFootprint'
import type { CardRotationDeg } from '@/types/printSettings'

function removeIframe(iframe: HTMLIFrameElement) {
  if (iframe.parentNode) {
    iframe.parentNode.removeChild(iframe)
  }
}

const MIN_CLEANUP_TIMEOUT_MS = 60_000
const CLEANUP_TIMEOUT_MS_PER_PAGE = 200

// A fixed timeout risks tearing down the iframe (and the print dialog reading from it)
// while a large batch is still rendering its print preview; scale the grace period with
// page count instead.
function cleanupTimeoutMs(pageCount: number): number {
  return Math.max(MIN_CLEANUP_TIMEOUT_MS, pageCount * CLEANUP_TIMEOUT_MS_PER_PAGE)
}

// SVGs loaded as an <img> resource render in a restricted "image mode" in
// some browsers, where nested resources (e.g. a background <image> with a
// data: href) inside the SVG can fail to render even though the SVG file
// opened directly, or the same markup inserted inline into the DOM, is
// fine. Inlining the raw <svg> markup avoids that mode entirely.
function waitForImages(frameDocument: Document): Promise<void> {
  const images = Array.from(frameDocument.querySelectorAll('svg image'))
  const pending = images.filter((image) => {
    const href = image.getAttribute('href')
    return href != null && href !== ''
  })
  if (pending.length === 0) {
    return Promise.resolve()
  }
  return new Promise((resolve) => {
    let remaining = pending.length
    const onSettled = () => {
      remaining -= 1
      if (remaining <= 0) {
        resolve()
      }
    }
    for (const image of pending) {
      image.addEventListener('load', onSettled, { once: true })
      image.addEventListener('error', onSettled, { once: true })
    }
  })
}

export class PrintCancelledError extends Error {
  constructor() {
    super('Print cancelled')
    this.name = 'PrintCancelledError'
  }
}

export async function printBadgePages(
  pageSvgs: string[],
  pageSizeCss: string,
  pageWidthMm: number,
  pageHeightMm: number,
  cardXMm: number,
  cardYMm: number,
  cardWidthMm: number,
  cardHeightMm: number,
  cardRotationDeg: CardRotationDeg,
  backSideRotated180 = false,
  cardBorderRadiusMm = 0,
  signal?: AbortSignal,
): Promise<void> {
  if (pageSvgs.length === 0) {
    return
  }
  if (signal?.aborted) {
    throw new PrintCancelledError()
  }

  const iframe = document.createElement('iframe')
  iframe.style.position = 'fixed'
  iframe.style.width = '0'
  iframe.style.height = '0'
  iframe.style.border = '0'
  iframe.style.visibility = 'hidden'
  document.body.appendChild(iframe)

  const { imgLeftMm, imgTopMm } = getCardFootprint(cardXMm, cardYMm, cardWidthMm, cardHeightMm, cardRotationDeg)
  const clipStyle = cardBorderRadiusMm > 0 ? `clip-path:inset(0 round ${cardBorderRadiusMm}mm);` : ''

  const pagesHtml = pageSvgs
    .map((svg, index) => {
      const breakStyle = index < pageSvgs.length - 1 ? 'page-break-after:always;break-after:page;' : ''
      const isBackSide = backSideRotated180 && index % 2 === 1
      const rotations = [cardRotationDeg !== 0 ? `rotate(${cardRotationDeg}deg)` : '', isBackSide ? 'rotate(180deg)' : ''].filter(Boolean)
      const rotateStyle = rotations.length > 0 ? `transform:${rotations.join(' ')};` : ''
      const svgWrapperStyle = `position:absolute;left:${imgLeftMm}mm;top:${imgTopMm}mm;width:${cardWidthMm}mm;height:${cardHeightMm}mm;${rotateStyle}${clipStyle}`
      const inlineSvg = svg.replace('<svg ', `<svg style="width:100%;height:100%;display:block;" `)
      return `<div style="position:relative;width:${pageWidthMm}mm;height:${pageHeightMm}mm;overflow:hidden;${breakStyle}"><div style="${svgWrapperStyle}">${inlineSvg}</div></div>`
    })
    .join('\n')

  const frameDocument = iframe.contentDocument
  if (!frameDocument) {
    removeIframe(iframe)
    throw new Error('Print failed: could not access print frame document')
  }

  frameDocument.open()
  frameDocument.write(`
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8" />
        <style>
          @page { size: ${pageSizeCss}; margin: 0; }
          body { margin: 0; }
        </style>
      </head>
      <body>${pagesHtml}</body>
    </html>
  `)
  frameDocument.close()

  const printWindow = iframe.contentWindow
  if (!printWindow) {
    removeIframe(iframe)
    throw new Error('Print failed: could not access print frame window')
  }

  let cleanedUp = false
  let resolveCleanup: (() => void) | null = null
  const cleanupDone = new Promise<void>((resolve) => { resolveCleanup = resolve })
  const cleanup = () => {
    if (cleanedUp) return
    cleanedUp = true
    clearTimeout(fallbackTimeoutId)
    removeIframe(iframe)
    resolveCleanup?.()
  }
  printWindow.addEventListener('afterprint', cleanup)
  const fallbackTimeoutId = setTimeout(cleanup, cleanupTimeoutMs(pageSvgs.length))

  frameDocument.fonts.forEach(face => { void face.load() })
  await Promise.all([waitForImages(frameDocument), frameDocument.fonts.ready])

  // This is the last point cancellation can still prevent the OS print dialog from
  // opening at all; once printWindow.print() is called, the browser owns the dialog
  // and nothing in this function can stop it.
  if (signal?.aborted) {
    cleanup()
    throw new PrintCancelledError()
  }

  printWindow.focus()
  printWindow.print()
  // Resolving only once the dialog has closed (afterprint) or the fallback timeout
  // fires lets callers that print in sequential chunks wait for one dialog to close
  // before building the next iframe, instead of opening several print dialogs at once.
  await cleanupDone
}

// Must stay even: printBadgePages alternates each chunk's back-side rotation via
// `index % 2 === 1` on the chunk-local page index, so a chunk boundary that splits a
// front/back pair would apply the wrong rotation to the page after the split.
const PRINT_CHUNK_SIZE = 200

// Splits a large print job into fixed-size chunks and prints them one at a time,
// each in its own iframe/print dialog, waiting for one dialog to close before the
// next chunk's iframe is built. This keeps per-chunk DOM size and waitForImages
// fan-out bounded regardless of total page count; the tradeoff is that batches
// larger than PRINT_CHUNK_SIZE open multiple sequential print dialogs.
export async function printBadgePagesChunked(
  pageSvgs: string[],
  pageSizeCss: string,
  pageWidthMm: number,
  pageHeightMm: number,
  cardXMm: number,
  cardYMm: number,
  cardWidthMm: number,
  cardHeightMm: number,
  cardRotationDeg: CardRotationDeg,
  backSideRotated180 = false,
  cardBorderRadiusMm = 0,
  signal?: AbortSignal,
  onChunkProgress?: (chunkIndex: number, totalChunks: number) => void,
): Promise<void> {
  if (pageSvgs.length === 0) {
    return
  }
  const chunks: string[][] = []
  for (let start = 0; start < pageSvgs.length; start += PRINT_CHUNK_SIZE) {
    chunks.push(pageSvgs.slice(start, start + PRINT_CHUNK_SIZE))
  }
  for (const [chunkIndex, chunk] of chunks.entries()) {
    if (signal?.aborted) {
      throw new PrintCancelledError()
    }
    onChunkProgress?.(chunkIndex + 1, chunks.length)
    await printBadgePages(
      chunk,
      pageSizeCss,
      pageWidthMm,
      pageHeightMm,
      cardXMm,
      cardYMm,
      cardWidthMm,
      cardHeightMm,
      cardRotationDeg,
      backSideRotated180,
      cardBorderRadiusMm,
      signal,
    )
  }
}
