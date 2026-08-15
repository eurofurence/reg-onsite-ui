import { fontFamilyNameFor, renderBadgeSvg } from '@/composables/print/badgeHtml'
import { printSettingsRef } from '@/composables/services/badgeConfigStore'
import type { BadgeType } from '@/types/badgeType'
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

async function fetchFontBase64(fontUrl: string): Promise<string | null> {
  try {
    const response = await fetch(fontUrl)
    const buffer = await response.arrayBuffer()
    let binary = ''
    for (const byte of new Uint8Array(buffer)) binary += String.fromCharCode(byte)
    return btoa(binary)
  } catch {
    return null
  }
}

async function registerCustomFonts(doc: jsPDF, resolvedBadgeType: BadgeType) {
  const fieldsWithFont = resolvedBadgeType.fields.custom.filter((field) => field.fontUrl)
  for (const field of fieldsWithFont) {
    const base64 = await fetchFontBase64(field.fontUrl)
    if (!base64) continue
    const fontFamilyName = fontFamilyNameFor(field.id, resolvedBadgeType.id)
    const vfsFilename = `${fontFamilyName}.otf`
    doc.addFileToVFS(vfsFilename, base64)
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

export async function downloadBadgePdf(
  resolvedBadgeType: BadgeType,
  fieldValues: Record<string, string>,
  filenameBase: string,
) {
  const printSettings = printSettingsRef.value
  const svg = await renderBadgeSvg(resolvedBadgeType, fieldValues, printSettings.cardWidthMm, printSettings.cardHeightMm, printSettings.dpi)
  const svgElement = new DOMParser().parseFromString(svg, 'image/svg+xml').documentElement

  const doc = new jsPDF({
    orientation: printSettings.cardWidthMm > printSettings.cardHeightMm ? 'landscape' : 'portrait',
    unit: 'mm',
    format: [printSettings.cardWidthMm, printSettings.cardHeightMm],
  })
  await registerCustomFonts(doc, resolvedBadgeType)
  await doc.svg(svgElement, { x: 0, y: 0, width: printSettings.cardWidthMm, height: printSettings.cardHeightMm })
  doc.save(`${filenameBase}.pdf`)
}
