import { fontFamilyNameFor, renderBadgeSvg, renderBadgeSvgForPdf } from '@/composables/print/badgeHtml'
import type { TextFieldLayout } from '@/composables/print/badgeHtml'
import { getCardFootprint } from '@/composables/print/cardFootprint'
import { buildOutlinedTextField } from '@/composables/print/textOutline'
import { printSettingsRef } from '@/composables/services/badgeConfigStore'
import type { BadgeType } from '@/types/badgeType'
import { getOrientedPageDimensionsMm } from '@/types/printSettings'
import { jsPDF } from 'jspdf'
import 'svg2pdf.js'

function downloadBlob(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = filename
  link.click()
  URL.revokeObjectURL(url)
}

async function fetchFontBuffer(fontUrl: string): Promise<ArrayBuffer | null> {
  try {
    const response = await fetch(fontUrl)
    if (!response.ok) {
      return null
    }
    return await response.arrayBuffer()
  } catch {
    return null
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
) {
  const layoutsByFieldId = new Map(textFieldLayouts.map((layout) => [layout.fieldId, layout]))
  const fieldsWithFont = resolvedBadgeType.fields.custom.filter((field) => field.fontUrl)
  for (const field of fieldsWithFont) {
    const buffer = await fetchFontBuffer(field.fontUrl)
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
    const vfsFilename = `${fontFamilyName}.otf`
    doc.addFileToVFS(vfsFilename, arrayBufferToBase64(buffer))
    doc.addFont(vfsFilename, fontFamilyName, 'normal')
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

async function addBadgePage(
  doc: jsPDF,
  resolvedBadgeType: BadgeType,
  svg: string,
  textFieldLayouts: TextFieldLayout[],
  rotationDeg: number,
) {
  const printSettings = printSettingsRef.value
  const svgElement = new DOMParser().parseFromString(svg, 'image/svg+xml').documentElement
  await registerCustomFonts(doc, resolvedBadgeType, svgElement, textFieldLayouts)

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

  await addBadgePage(doc, resolvedBadgeType, svg, textFieldLayouts, printSettings.cardRotationDeg)
  if (printSettings.doubleSided) {
    const backRotationDeg = printSettings.cardRotationDeg + (printSettings.backSideRotated180 ? 180 : 0)
    doc.addPage([pageDimensions.width, pageDimensions.height], pageDimensions.width > pageDimensions.height ? 'landscape' : 'portrait')
    await addBadgePage(doc, resolvedBadgeType, svg, textFieldLayouts, backRotationDeg)
  }

  doc.save(`${filenameBase}.pdf`)
}
