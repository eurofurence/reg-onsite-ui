function removeIframe(iframe: HTMLIFrameElement) {
  if (iframe.parentNode) {
    iframe.parentNode.removeChild(iframe)
  }
}

function waitForImages(frameDocument: Document): Promise<void> {
  const images = Array.from(frameDocument.images)
  const pending = images.filter((image) => !image.complete)
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
  pages: string[],
  pageSizeCss: string,
  pageWidthMm: number,
  pageHeightMm: number,
): Promise<void> {
  if (pages.length === 0) {
    return
  }

  const iframe = document.createElement('iframe')
  iframe.style.position = 'fixed'
  iframe.style.width = '0'
  iframe.style.height = '0'
  iframe.style.border = '0'
  iframe.style.visibility = 'hidden'
  document.body.appendChild(iframe)

  const pagesHtml = pages
    .map((pageHtml, index) => {
      const breakStyle = index < pages.length - 1 ? 'page-break-after:always;break-after:page;' : ''
      return `<div style="width:${pageWidthMm}mm;height:${pageHeightMm}mm;overflow:hidden;display:flex;align-items:center;justify-content:center;${breakStyle}">${pageHtml}</div>`
    })
    .join('\n')

  const frameDocument = iframe.contentDocument
  if (!frameDocument) {
    removeIframe(iframe)
    return
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
    return
  }

  printWindow.addEventListener('afterprint', () => removeIframe(iframe))
  setTimeout(() => removeIframe(iframe), 60_000)

  frameDocument.fonts.forEach(face => { void face.load() })
  await Promise.all([waitForImages(frameDocument), frameDocument.fonts.ready])

  printWindow.focus()
  printWindow.print()
}
