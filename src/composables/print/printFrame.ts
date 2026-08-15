import { getCardFootprint } from '@/composables/print/cardFootprint'
import type { CardRotationDeg } from '@/types/printSettings'

function removeIframe(iframe: HTMLIFrameElement) {
  if (iframe.parentNode) {
    iframe.parentNode.removeChild(iframe)
  }
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
): Promise<void> {
  if (pageSvgs.length === 0) {
    return
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
  const cleanup = () => {
    if (cleanedUp) return
    cleanedUp = true
    clearTimeout(fallbackTimeoutId)
    removeIframe(iframe)
  }
  printWindow.addEventListener('afterprint', cleanup)
  const fallbackTimeoutId = setTimeout(cleanup, 60_000)

  frameDocument.fonts.forEach(face => { void face.load() })
  await Promise.all([waitForImages(frameDocument), frameDocument.fonts.ready])

  printWindow.focus()
  printWindow.print()
}
