import * as bwipjs from 'bwip-js/browser'
import type { BackgroundFit, BadgeType, CustomBarcodeFieldState, FieldPosition, FieldSize, FontSizeOverflowMode, TextAlign, TextFieldState } from '@/types/badgeType'

const TEXT_ANCHOR_BY_ALIGN: Record<TextAlign, string> = {
  left: 'start',
  center: 'middle',
  right: 'end',
}

const DEFAULT_TRUNCATE_LENGTH = 100
export const DEFAULT_DPI = 96
export const MM_PER_INCH = 25.4
const PT_PER_INCH = 72

export function widthPxAtDpi(widthMm: number, dpi: number): number {
  return widthMm / MM_PER_INCH * dpi
}

function ptToPxAtDpi(pt: number, dpi: number): number {
  return pt / PT_PER_INCH * dpi
}

export function fontFamilyNameFor(fieldId: string, badgeTypeId: string): string {
  return `badge-font-${fieldId}-${badgeTypeId}`
}

let measureContext: CanvasRenderingContext2D | null = null

export function fitFontSize(text: string, pixelWidth: number, pixelHeight: number, fontFamily: string, dpi = DEFAULT_DPI): number {
  const minFontSizePx = 8 / DEFAULT_DPI * dpi
  const maxFontSizePx = 60 / DEFAULT_DPI * dpi
  if (!measureContext) {
    measureContext = document.createElement('canvas').getContext('2d')
  }
  if (!measureContext || !text || pixelWidth <= 0 || pixelHeight <= 0) {
    return minFontSizePx
  }
  const referenceFontSizePx = 100
  measureContext.font = `${referenceFontSizePx}px ${fontFamily}`
  const referenceWidth = measureContext.measureText(text).width
  const horizontalPadding = 4 / DEFAULT_DPI * dpi
  const widthFitSizePx =
    (pixelWidth - horizontalPadding) / referenceWidth * referenceFontSizePx
  // Cap at 80% of box height for breathing room around ascenders/descenders.
  const heightCapPx = pixelHeight * 0.8
  // No floor here: shrinking to fit is preferable to overflow when the box can't fit minFontSizePx.
  return Math.max(1, Math.min(widthFitSizePx, heightCapPx, maxFontSizePx))
}

// Tracks the loaded fontUrl per family so a changed font URL is reloaded instead of skipped.
const loadedFontUrlByFamily = new Map<string, string>()

export async function loadFontForMeasurement(familyName: string, fontUrl: string): Promise<void> {
  const previouslyLoadedUrl = loadedFontUrlByFamily.get(familyName)
  if (previouslyLoadedUrl === fontUrl && document.fonts.check(`1px ${familyName}`)) {
    return
  }
  const fontFace = new FontFace(familyName, `url(${JSON.stringify(fontUrl)})`)
  try {
    await fontFace.load()
    for (const existingFace of document.fonts) {
      if (existingFace.family === familyName) {
        document.fonts.delete(existingFace)
      }
    }
    document.fonts.add(fontFace)
    loadedFontUrlByFamily.set(familyName, fontUrl)
  } catch {
    // Measurement falls back to the next font in the family list.
  }
}

function escapeXml(text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')
}

export interface FieldBox {
  left: number
  top: number
  width: number
  height: number
}

export function fieldBoxPx(pos: FieldPosition, size: FieldSize, cardWidthPx: number, cardHeightPx: number): FieldBox {
  return {
    left: pos.x / 100 * cardWidthPx,
    top: pos.y / 100 * cardHeightPx,
    width: size.width / 100 * cardWidthPx,
    height: size.height / 100 * cardHeightPx,
  }
}

export interface BarcodeMarkup {
  viewBox: string
  innerSvg: string
}

export function barcodeMarkup(
  style: string,
  inverted: boolean,
  idValue: string,
  color = '000000',
  transparentBackground = false,
): BarcodeMarkup {
  // Inverted swaps bars/background: white bars on `color` instead of the reverse.
  const barcolor = inverted ? 'FFFFFF' : color
  const bwipOpts: Parameters<typeof bwipjs.toSVG>[0] = {
    bcid: style,
    text: idValue || ' ',
    barcolor,
  }
  if (!transparentBackground) {
    bwipOpts.backgroundcolor = inverted ? color : 'FFFFFF'
  }
  const rawSvg = bwipjs.toSVG(bwipOpts)
  const viewBoxMatch = /viewBox="([^"]+)"/.exec(rawSvg)
  const viewBox = viewBoxMatch?.[1] ?? '0 0 24 24'
  const innerSvg = rawSvg.replace(/^<svg[^>]*>/, '').replace(/<\/svg>\s*$/, '')
  return { viewBox, innerSvg }
}

function renderBarcodeSvg(
  style: string,
  inverted: boolean,
  idValue: string,
  box: FieldBox,
  color = '000000',
  transparentBackground = false,
): string {
  const { viewBox, innerSvg } = barcodeMarkup(style, inverted, idValue, color, transparentBackground)
  return `<svg x="${box.left}" y="${box.top}" width="${box.width}" height="${box.height}" viewBox="${viewBox}">${innerSvg}</svg>`
}

function renderCustomBarcode(
  field: CustomBarcodeFieldState,
  idValue: string,
  cardWidthPxAtPrintDpi: number,
  cardHeightPxAtPrintDpi: number,
): string {
  const boxPx = fieldBoxPx(field.pos, field.size, cardWidthPxAtPrintDpi, cardHeightPxAtPrintDpi)
  return renderBarcodeSvg(
    field.style,
    field.inverted,
    idValue,
    boxPx,
    field.color ?? '000000',
    field.transparentBackground ?? false,
  )
}

export function textAnchorFor(align: TextAlign): string {
  return TEXT_ANCHOR_BY_ALIGN[align]
}

export function textXFor(box: FieldBox, align: TextAlign): number {
  const xByAlign: Record<TextAlign, number> = {
    left: box.left,
    center: box.left + box.width / 2,
    right: box.left + box.width,
  }
  return xByAlign[align]
}

export interface TextLine {
  text: string
  y: number
}

export interface TextLayout {
  textX: number
  singleLineY: number
  lines: TextLine[]
}

// Vertically centers by measured glyph ascent/descent, falling back to a 0.35em split if canvas measurement is unavailable.
export function computeTextLayout(
  box: FieldBox,
  fontSizePx: number,
  fontFamily: string,
  text: string,
  align: TextAlign,
  isWrapping?: boolean,
  lineHeightPx?: number,
): TextLayout {
  const textX = textXFor(box, align)
  if (!measureContext) {
    measureContext = document.createElement('canvas').getContext('2d')
  }
  let ascent = fontSizePx * 0.35
  let descent = fontSizePx * -0.35
  if (measureContext) {
    measureContext.font = `${fontSizePx}px ${fontFamily}`
    const metrics = measureContext.measureText(text || ' ')
    ascent = metrics.actualBoundingBoxAscent
    descent = -metrics.actualBoundingBoxDescent
  }
  const textHeight = ascent - descent

  if (!isWrapping || lineHeightPx == null) {
    const singleLineY = box.top + box.height / 2 - textHeight / 2 + ascent
    return { textX, singleLineY, lines: [{ text, y: singleLineY }] }
  }
  const lines = text.split('\n')
  const totalHeight = lines.length * lineHeightPx
  const firstBaselineY = box.top + box.height / 2 - totalHeight / 2 + (lineHeightPx - textHeight) / 2 + ascent
  return {
    textX,
    singleLineY: firstBaselineY,
    lines: lines.map((line, index) => ({ text: line, y: firstBaselineY + index * lineHeightPx })),
  }
}

function textFieldSvg(options: {
  fieldId: string
  text: string
  fontFamily: string
  box: FieldBox
  fontSizePx: number
  color: string
  align: TextAlign
  borderEnabled?: boolean
  borderColor?: string
  isWrapping?: boolean
  lineHeightPx?: number
  clip?: boolean
}): string {
  const { fieldId, text, fontFamily, box, fontSizePx, color, align, borderEnabled, borderColor, isWrapping, lineHeightPx, clip } = options
  const anchor = textAnchorFor(align)
  const strokeAttrs = borderEnabled ? ` stroke="#${borderColor ?? '000000'}" stroke-width="1"` : ''
  const commonAttrs = `data-field-id="${fieldId}" font-family="${fontFamily}" font-size="${fontSizePx}" fill="#${color}" text-anchor="${anchor}"${strokeAttrs}`

  const layout = computeTextLayout(box, fontSizePx, fontFamily, text, align, isWrapping, lineHeightPx)

  let textMarkup: string
  if (!isWrapping || lineHeightPx == null) {
    textMarkup = `<text x="${layout.textX}" y="${layout.singleLineY}" ${commonAttrs}>${escapeXml(text)}</text>`
  } else {
    const tspans = layout.lines
      .map((line) => `<tspan x="${layout.textX}" y="${line.y}">${escapeXml(line.text)}</tspan>`)
      .join('')
    textMarkup = `<text ${commonAttrs}>${tspans}</text>`
  }

  if (!clip) {
    return textMarkup
  }
  const clipId = `text-clip-${Math.random().toString(36).slice(2)}`
  return `
    <clipPath id="${clipId}"><rect x="${box.left}" y="${box.top}" width="${box.width}" height="${box.height}" /></clipPath>
    <g clip-path="url(#${clipId})">${textMarkup}</g>`
}

export interface BackgroundImageAttrs {
  x: string
  y: string
  width: string
  height: string
  preserveAspectRatio: string
  transform?: string
  clip: boolean
}

export function backgroundImageAttrs(
  fit: BackgroundFit,
  alignH: string,
  alignV: string,
  cardWidthPx: number,
  cardHeightPx: number,
): BackgroundImageAttrs {
  if (fit === 'fill') {
    return { x: '0', y: '0', width: `${cardWidthPx}`, height: `${cardHeightPx}`, preserveAspectRatio: 'none', clip: false }
  }
  if (fit === 'cover' || fit === 'contain') {
    const align: Record<string, string> = { left: 'x Min', center: 'x Mid', right: 'x Max' }
    const vAlign: Record<string, string> = { top: 'YMin', center: 'YMid', bottom: 'YMax' }
    const hPart = (align[alignH] ?? 'xMid').replace('x ', 'x')
    const preserveAspectRatio = `${hPart}${vAlign[alignV] ?? 'YMid'} ${fit === 'cover' ? 'slice' : 'meet'}`
    return { x: '0', y: '0', width: `${cardWidthPx}`, height: `${cardHeightPx}`, preserveAspectRatio, clip: false }
  }
  // fit-width / fit-height: scale to one dimension, keep native aspect ratio, clip to card via a clipPath.
  if (fit === 'fit-width') {
    const yByAlign: Record<string, string> = { top: '0', center: '50%', bottom: '100%' }
    const translateY = alignV === 'top' ? '0' : alignV === 'bottom' ? '-100%' : '-50%'
    return {
      x: '0', y: yByAlign[alignV] ?? '50%', width: `${cardWidthPx}`, height: 'auto',
      preserveAspectRatio: 'xMidYMid meet', transform: `translate(0, ${translateY})`, clip: true,
    }
  }
  const xByAlign: Record<string, string> = { left: '0', center: '50%', right: '100%' }
  const translateX = alignH === 'left' ? '0' : alignH === 'right' ? '-100%' : '-50%'
  return {
    x: xByAlign[alignH] ?? '50%', y: '0', width: 'auto', height: `${cardHeightPx}`,
    preserveAspectRatio: 'xMidYMid meet', transform: `translate(${translateX}, 0)`, clip: true,
  }
}

function backgroundImageSvg(
  href: string,
  fit: BackgroundFit,
  alignH: string,
  alignV: string,
  cardWidthPx: number,
  cardHeightPx: number,
): string {
  const attrs = backgroundImageAttrs(fit, alignH, alignV, cardWidthPx, cardHeightPx)
  const transformAttr = attrs.transform ? ` transform="${attrs.transform}"` : ''
  const image = `<image data-role="background" href="${href}" x="${attrs.x}" y="${attrs.y}" width="${attrs.width}" height="${attrs.height}" preserveAspectRatio="${attrs.preserveAspectRatio}"${transformAttr} />`
  if (!attrs.clip) {
    return image
  }
  const clipId = `bg-clip-${Math.random().toString(36).slice(2)}`
  return `
    <clipPath id="${clipId}"><rect x="0" y="0" width="${cardWidthPx}" height="${cardHeightPx}" /></clipPath>
    <g data-role="background" clip-path="url(#${clipId})">
      ${image}
    </g>`
}

interface RenderedTextField {
  key: string
  markup: string
}

export interface DisplayText {
  displayValue: string
  isWrapping: boolean
  wrappedValue: string
}

export function resolveDisplayText(field: TextFieldState, rawValue: string): DisplayText {
  const truncateAt = field.truncateAt ?? DEFAULT_TRUNCATE_LENGTH
  const displayValue = rawValue.length > truncateAt
    ? rawValue.slice(0, truncateAt) + '...'
    : rawValue
  const isWrapping = field.wrapAt != null && displayValue.length > field.wrapAt
  const wrappedValue = isWrapping
    ? displayValue.slice(0, field.wrapAt!) + '\n' + displayValue.slice(field.wrapAt!)
    : displayValue
  return { displayValue, isWrapping, wrappedValue }
}

export function fontFamilyFor(field: { fontUrl: string }, fontFamilyName: string): string {
  return field.fontUrl ? `'${fontFamilyName}', sans-serif` : 'sans-serif'
}

export interface FontSizeResult {
  fontSizePx: number
  clip: boolean
}

export function computeFontSizePx(
  field: TextFieldState,
  displayText: DisplayText,
  fontFamily: string,
  boxPx: FieldBox,
  dpi: number,
): FontSizeResult {
  const { displayValue, isWrapping } = displayText

  function autoFitFontSizePx(): number {
    return isWrapping
      ? fitFontSize(
          [displayValue.slice(0, field.wrapAt!), displayValue.slice(field.wrapAt!)].reduce((a, b) => a.length >= b.length ? a : b),
          boxPx.width,
          boxPx.height / 2,
          fontFamily,
          dpi,
        )
      : fitFontSize(displayValue, boxPx.width, boxPx.height, fontFamily, dpi)
  }

  const overflowMode: FontSizeOverflowMode = field.overflowMode ?? 'shrink'
  if (field.fontSizePt == null) {
    return { fontSizePx: autoFitFontSizePx(), clip: true }
  }
  const requestedFontSizePx = ptToPxAtDpi(field.fontSizePt, dpi)
  if (overflowMode === 'shrink') {
    return { fontSizePx: Math.min(autoFitFontSizePx(), requestedFontSizePx), clip: true }
  }
  return { fontSizePx: requestedFontSizePx, clip: overflowMode === 'clip' }
}

export function lineHeightPxFor(field: TextFieldState, isWrapping: boolean, fontSizePx: number, cardHeightPxAtPrintDpi: number): number | undefined {
  if (!isWrapping) {
    return undefined
  }
  return field.wrapLineHeight != null
    ? field.wrapLineHeight / 100 * cardHeightPxAtPrintDpi
    : fontSizePx * 1.2
}

export interface TextFieldLayout {
  fieldId: string
  color: string
  align: TextAlign
  box: FieldBox
  fontSizePx: number
  lines: TextLine[]
}

function renderTextField(
  key: string,
  field: TextFieldState,
  rawValue: string,
  badgeTypeId: string,
  cardWidthPxAtPrintDpi: number,
  cardHeightPxAtPrintDpi: number,
  dpi: number,
): { fontUrl: string; fontFamilyName: string; render: () => string; layout: () => TextFieldLayout } {
  const displayText = resolveDisplayText(field, rawValue)
  const boxPx = fieldBoxPx(field.pos, field.size, cardWidthPxAtPrintDpi, cardHeightPxAtPrintDpi)
  const fontFamilyName = fontFamilyNameFor(key, badgeTypeId)
  const fontFamily = fontFamilyFor(field, fontFamilyName)

  function computeLayout() {
    const { fontSizePx, clip } = computeFontSizePx(field, displayText, fontFamily, boxPx, dpi)
    const lineHeightPx = lineHeightPxFor(field, displayText.isWrapping, fontSizePx, cardHeightPxAtPrintDpi)
    const textLayout = computeTextLayout(boxPx, fontSizePx, fontFamily, displayText.wrappedValue, field.align, displayText.isWrapping, lineHeightPx)
    return { fontSizePx, clip, textLayout }
  }

  return {
    fontUrl: field.fontUrl,
    fontFamilyName,
    render: () => {
      const { fontSizePx, clip } = computeLayout()
      const lineHeightPx = lineHeightPxFor(field, displayText.isWrapping, fontSizePx, cardHeightPxAtPrintDpi)
      return textFieldSvg({
        fieldId: key,
        text: displayText.wrappedValue,
        fontFamily,
        box: boxPx,
        fontSizePx,
        color: field.color,
        align: field.align,
        borderEnabled: field.borderEnabled,
        borderColor: field.borderColor,
        isWrapping: displayText.isWrapping,
        lineHeightPx,
        clip,
      })
    },
    layout: () => {
      const { fontSizePx, textLayout } = computeLayout()
      return {
        fieldId: key,
        color: field.color,
        align: field.align,
        box: boxPx,
        fontSizePx,
        lines: textLayout.lines,
      }
    },
  }
}

export interface RenderedBadgeSvg {
  svg: string
  textFieldLayouts: TextFieldLayout[]
}

async function renderBadgeSvgWithLayouts(
  badgeType: BadgeType,
  fieldValues: Record<string, string>,
  cardWidthMm: number,
  cardHeightMm: number,
  dpi = DEFAULT_DPI,
): Promise<RenderedBadgeSvg> {
  const cardWidthPxAtPrintDpi = widthPxAtDpi(cardWidthMm, dpi)
  const cardHeightPxAtPrintDpi = cardWidthPxAtPrintDpi * (cardHeightMm / cardWidthMm)

  const barcodeSvgMarkup = badgeType.fields.customBarcodes
    .filter((field) => field.enabled)
    .map((field) => renderCustomBarcode(field, fieldValues[field.id] ?? '', cardWidthPxAtPrintDpi, cardHeightPxAtPrintDpi))
    .join('\n')

  const { url: backgroundUrl, fit: backgroundFit, alignH, alignV } = badgeType.background
  const backgroundImageSvgMarkup = backgroundUrl
    ? backgroundImageSvg(backgroundUrl, backgroundFit, alignH, alignV, cardWidthPxAtPrintDpi, cardHeightPxAtPrintDpi)
    : ''

  const prepared = badgeType.fields.custom.map((field) => ({
    key: field.id,
    enabled: field.enabled,
    ...renderTextField(field.id, field, fieldValues[field.id] ?? '', badgeType.id, cardWidthPxAtPrintDpi, cardHeightPxAtPrintDpi, dpi),
  }))

  await Promise.all(
    prepared.map((entry) => entry.fontUrl ? loadFontForMeasurement(entry.fontFamilyName, entry.fontUrl) : Promise.resolve()),
  )

  const renderedTextFields: RenderedTextField[] = prepared
    .filter((entry) => entry.enabled)
    .map((entry) => ({ key: entry.key, markup: entry.render() }))

  const textFieldLayouts: TextFieldLayout[] = prepared
    .filter((entry) => entry.enabled)
    .map((entry) => entry.layout())

  const fontFaces = prepared
    .map((entry) => entry.fontUrl ? `@font-face { font-family: '${entry.fontFamilyName}'; src: url('${entry.fontUrl}') format('opentype'); }` : '')
    .filter(Boolean)

  const fontFaceStyleSvg = fontFaces.length > 0 ? `<style>${fontFaces.join('\n')}</style>` : ''

  const cardSvg = `
    <svg xmlns="http://www.w3.org/2000/svg" width="${cardWidthMm}mm" height="${cardHeightMm}mm" viewBox="0 0 ${cardWidthPxAtPrintDpi} ${cardHeightPxAtPrintDpi}" font-family="sans-serif">
      <defs>${fontFaceStyleSvg}</defs>
      <rect x="0" y="0" width="${cardWidthPxAtPrintDpi}" height="${cardHeightPxAtPrintDpi}" fill="#${badgeType.background.color}" />
      ${backgroundImageSvgMarkup}
      ${renderedTextFields.map((entry) => entry.markup).join('\n')}
      ${barcodeSvgMarkup}
    </svg>
  `

  return { svg: cardSvg, textFieldLayouts }
}

export async function renderBadgeSvg(
  badgeType: BadgeType,
  fieldValues: Record<string, string>,
  cardWidthMm: number,
  cardHeightMm: number,
  dpi = DEFAULT_DPI,
): Promise<string> {
  const { svg } = await renderBadgeSvgWithLayouts(badgeType, fieldValues, cardWidthMm, cardHeightMm, dpi)
  return svg
}

export async function renderBadgeSvgForPdf(
  badgeType: BadgeType,
  fieldValues: Record<string, string>,
  cardWidthMm: number,
  cardHeightMm: number,
  dpi = DEFAULT_DPI,
): Promise<RenderedBadgeSvg> {
  return renderBadgeSvgWithLayouts(badgeType, fieldValues, cardWidthMm, cardHeightMm, dpi)
}
