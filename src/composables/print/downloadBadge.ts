import { fontFamilyNameFor, renderBadgeSvg, renderBadgeSvgForPdf, widthPxAtDpi } from '@/composables/print/badgeHtml'
import type { TextFieldLayout } from '@/composables/print/badgeHtml'
import { computeBackgroundPlacement, createBackgroundImageCache, fetchBackgroundImageCached } from '@/composables/print/backgroundImageCache'
import type { BackgroundImageCache } from '@/composables/print/backgroundImageCache'
import { getCardFootprint } from '@/composables/print/cardFootprint'
import { createFontBufferCache, fetchFontBufferCached } from '@/composables/print/fontBufferCache'
import type { FontBufferCache } from '@/composables/print/fontBufferCache'
import { buildOutlinedTextField } from '@/composables/print/textOutline'
import { printSettingsRef } from '@/composables/services/badgeConfigStore'
import type { BadgeType } from '@/types/badgeType'
import { getOrientedPageDimensionsMm } from '@/types/printSettings'
import { jsPDF } from 'jspdf'
import 'svg2pdf.js'

export function downloadBlob(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = filename
  link.click()
  URL.revokeObjectURL(url)
}

// Bundles the per-export-job caches so a whole batch of badges (potentially
// thousands) can share fetched fonts/background images and font
// registrations across entries, instead of re-fetching per badge.
export interface BadgeRenderJob {
  fontBufferCache: FontBufferCache
  backgroundImageCache: BackgroundImageCache
  registeredFontFamilies: Set<string>
}

export function createBadgeRenderJob(): BadgeRenderJob {
  return {
    fontBufferCache: createFontBufferCache(),
    backgroundImageCache: createBackgroundImageCache(),
    registeredFontFamilies: new Set(),
  }
}

function arrayBufferToBase64(buffer: ArrayBuffer): string {
  let binary = ''
  for (const byte of new Uint8Array(buffer)) binary += String.fromCharCode(byte)
  return btoa(binary)
}

// jsPDF can only embed TrueType-outline fonts, not CFF-flavored OpenType
// (sfnt tag 'OTTO'), which is what most desktop-authored .otf files are.
function isUnsupportedCffOpenType(buffer: ArrayBuffer): boolean {
  if (buffer.byteLength < 4) {
    return false
  }
  const sfntVersion = new TextDecoder('ascii').decode(new Uint8Array(buffer, 0, 4))
  return sfntVersion === 'OTTO'
}

// Embeddable fonts register with jsPDF directly; unsupported CFF/OTTO fonts
// are instead outlined into SVG <path> geometry (via textOutline.ts) and
// swapped in for the field's <text> node, since svg2pdf.js can render paths
// without any font embedded.
async function registerCustomFonts(
  doc: jsPDF,
  resolvedBadgeType: BadgeType,
  svgElement: Element,
  textFieldLayouts: TextFieldLayout[],
  job: BadgeRenderJob,
) {
  const layoutsByFieldId = new Map(textFieldLayouts.map((layout) => [layout.fieldId, layout]))
  const fieldsWithFont = resolvedBadgeType.fields.custom.filter((field) => field.fontUrl)
  for (const field of fieldsWithFont) {
    const buffer = await fetchFontBufferCached(field.fontUrl, job.fontBufferCache)
    if (!buffer) continue
    if (isUnsupportedCffOpenType(buffer)) {
      const layout = layoutsByFieldId.get(field.id)
      const textNode = svgElement.querySelector(`[data-field-id="${field.id}"]`)
      if (!layout || !textNode) continue
      const outlined = buildOutlinedTextField(buffer, field.id, layout.color, layout.box, layout.fontSizePx, layout.align, layout.lines)
      const pathNode = svgElement.ownerDocument!.createElementNS('http://www.w3.org/2000/svg', 'path')
      pathNode.setAttribute('d', outlined.pathData)
      pathNode.setAttribute('fill', `#${outlined.color}`)
      textNode.replaceWith(pathNode)
      continue
    }
    const fontFamilyName = fontFamilyNameFor(field.id, resolvedBadgeType.id)
    if (job.registeredFontFamilies.has(fontFamilyName)) continue
    const vfsFilename = `${fontFamilyName}.otf`
    doc.addFileToVFS(vfsFilename, arrayBufferToBase64(buffer))
    doc.addFont(vfsFilename, fontFamilyName, 'normal')
    job.registeredFontFamilies.add(fontFamilyName)
  }
}

export async function downloadBadgeSvg(
  resolvedBadgeType: BadgeType,
  fieldValues: Record<string, string>,
  filenameBase: string,
) {
  const printSettings = printSettingsRef.value
  const svg = await renderBadgeSvg(resolvedBadgeType, fieldValues, printSettings.cardWidthMm, printSettings.cardHeightMm, printSettings.dpi)
  downloadBlob(new Blob([svg], { type: 'image/svg+xml' }), `${filenameBase}.svg`)
}

// Renders the background image directly via addImage (raw bytes + a URL-keyed alias)
// instead of leaving it in the SVG for svg2pdf.js: svg2pdf.js always re-encodes
// <image> hrefs to a base64 data URI internally before calling addImage, which hits
// jsPDF's ~4MB base64 string bug and re-fetches/re-rasterizes on every page even when
// many badges share one background.
async function renderBackgroundImage(
  doc: jsPDF,
  resolvedBadgeType: BadgeType,
  imgLeftMm: number,
  imgTopMm: number,
  job: BadgeRenderJob,
) {
  const backgroundUrl = resolvedBadgeType.background.url
  if (!backgroundUrl) {
    return
  }
  const cached = await fetchBackgroundImageCached(doc, backgroundUrl, job.backgroundImageCache)
  if (!cached) {
    return
  }
  const printSettings = printSettingsRef.value
  const cardWidthPx = widthPxAtDpi(printSettings.cardWidthMm, printSettings.dpi)
  const cardHeightPx = cardWidthPx * (printSettings.cardHeightMm / printSettings.cardWidthMm)
  const mmPerPx = printSettings.cardWidthMm / cardWidthPx
  const placement = computeBackgroundPlacement(
    resolvedBadgeType.background.fit,
    resolvedBadgeType.background.alignH,
    resolvedBadgeType.background.alignV,
    cardWidthPx,
    cardHeightPx,
    cached.naturalWidthPx,
    cached.naturalHeightPx,
  )

  doc.saveGraphicsState()
  if (placement.clip) {
    doc.rect(imgLeftMm, imgTopMm, printSettings.cardWidthMm, printSettings.cardHeightMm, null).clip()
  }
  doc.addImage(
    cached.bytes,
    cached.format,
    imgLeftMm + placement.drawX * mmPerPx,
    imgTopMm + placement.drawY * mmPerPx,
    placement.drawWidth * mmPerPx,
    placement.drawHeight * mmPerPx,
    backgroundUrl,
  )
  doc.restoreGraphicsState()
}

export async function addBadgePage(
  doc: jsPDF,
  resolvedBadgeType: BadgeType,
  svg: string,
  textFieldLayouts: TextFieldLayout[],
  rotationDeg: number,
  job: BadgeRenderJob,
) {
  const printSettings = printSettingsRef.value
  const svgElement = new DOMParser().parseFromString(svg, 'image/svg+xml').documentElement
  await registerCustomFonts(doc, resolvedBadgeType, svgElement, textFieldLayouts, job)
  svgElement.querySelector('[data-role="background"]')?.remove()

  const { imgLeftMm, imgTopMm } = getCardFootprint(
    printSettings.cardXMm,
    printSettings.cardYMm,
    printSettings.cardWidthMm,
    printSettings.cardHeightMm,
    printSettings.cardRotationDeg,
  )

  doc.saveGraphicsState()
  if (printSettings.cardBorderRadiusMm > 0) {
    doc.roundedRect(
      imgLeftMm,
      imgTopMm,
      printSettings.cardWidthMm,
      printSettings.cardHeightMm,
      printSettings.cardBorderRadiusMm,
      printSettings.cardBorderRadiusMm,
      null,
    ).clip()
  }
  if (rotationDeg !== 0) {
    const centerX = imgLeftMm + printSettings.cardWidthMm / 2
    const centerY = imgTopMm + printSettings.cardHeightMm / 2
    doc.saveGraphicsState()
    doc.setCurrentTransformationMatrix(doc.Matrix(1, 0, 0, 1, centerX, centerY))
    doc.setCurrentTransformationMatrix(
      doc.Matrix(
        Math.cos((rotationDeg * Math.PI) / 180),
        Math.sin((rotationDeg * Math.PI) / 180),
        -Math.sin((rotationDeg * Math.PI) / 180),
        Math.cos((rotationDeg * Math.PI) / 180),
        0,
        0,
      ),
    )
    doc.setCurrentTransformationMatrix(doc.Matrix(1, 0, 0, 1, -centerX, -centerY))
  }
  await renderBackgroundImage(doc, resolvedBadgeType, imgLeftMm, imgTopMm, job)
  await doc.svg(svgElement, { x: imgLeftMm, y: imgTopMm, width: printSettings.cardWidthMm, height: printSettings.cardHeightMm })
  if (rotationDeg !== 0) {
    doc.restoreGraphicsState()
  }
  doc.restoreGraphicsState()
}

export async function downloadBadgePdf(
  resolvedBadgeType: BadgeType,
  fieldValues: Record<string, string>,
  filenameBase: string,
) {
  const printSettings = printSettingsRef.value
  const { svg, textFieldLayouts } = await renderBadgeSvgForPdf(resolvedBadgeType, fieldValues, printSettings.cardWidthMm, printSettings.cardHeightMm, printSettings.dpi)
  const pageDimensions = getOrientedPageDimensionsMm(printSettings)

  const doc = new jsPDF({
    orientation: pageDimensions.width > pageDimensions.height ? 'landscape' : 'portrait',
    unit: 'mm',
    format: [pageDimensions.width, pageDimensions.height],
  })
  const job = createBadgeRenderJob()

  await addBadgePage(doc, resolvedBadgeType, svg, textFieldLayouts, printSettings.cardRotationDeg, job)
  if (printSettings.doubleSided) {
    const backRotationDeg = printSettings.cardRotationDeg + (printSettings.backSideRotated180 ? 180 : 0)
    doc.addPage([pageDimensions.width, pageDimensions.height], pageDimensions.width > pageDimensions.height ? 'landscape' : 'portrait')
    await addBadgePage(doc, resolvedBadgeType, svg, textFieldLayouts, backRotationDeg, job)
  }

  doc.save(`${filenameBase}.pdf`)
}
