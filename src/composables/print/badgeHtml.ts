import * as bwipjs from 'bwip-js/browser'
import type { BackgroundFit, BadgeType, TextAlign } from '@/types/badgeType'

const JUSTIFY_CONTENT_BY_ALIGN: Record<TextAlign, string> = {
  left: 'flex-start',
  center: 'center',
  right: 'flex-end',
}

const CM_PER_INCH = 2.54
const BADGE_WIDTH_CM = 8.56
const BADGE_HEIGHT_CM = 5.4
const CARD_ASPECT_RATIO = BADGE_WIDTH_CM / BADGE_HEIGHT_CM
const NAME_MAX_LENGTH = 100
const DEFAULT_DPI = 96
export const BADGE_WIDTH_PX = BADGE_WIDTH_CM / CM_PER_INCH * DEFAULT_DPI
const BADGE_HEIGHT_PX = BADGE_WIDTH_PX / CARD_ASPECT_RATIO

function badgeWidthPxAtDpi(dpi: number): number {
  return BADGE_WIDTH_CM / CM_PER_INCH * dpi
}

let measureContext: CanvasRenderingContext2D | null = null

function fitFontSize(text: string, pixelWidth: number, pixelHeight: number, fontFamily: string): number {
  if (!measureContext) {
    measureContext = document.createElement('canvas').getContext('2d')
  }
  if (!measureContext || !text || pixelWidth <= 0 || pixelHeight <= 0) {
    return 8
  }
  const referenceFontSizePx = 100
  measureContext.font = `${referenceFontSizePx}px ${fontFamily}`
  const referenceWidth = measureContext.measureText(text).width
  const horizontalPadding = 4
  const widthFitSizePx =
    (pixelWidth - horizontalPadding) / referenceWidth * referenceFontSizePx
  const heightCapPx = pixelHeight * 0.8
  return Math.min(Math.max(Math.min(widthFitSizePx, heightCapPx), 8), 60)
}

function fontFaceHtml(familyName: string, fontUrl: string): string {
  return `@font-face { font-family: '${familyName}'; src: url('${fontUrl}') format('opentype'); }`
}

async function loadFontForMeasurement(familyName: string, fontUrl: string): Promise<void> {
  if (document.fonts.check(`1px ${familyName}`)) {
    return
  }
  const fontFace = new FontFace(familyName, `url(${JSON.stringify(fontUrl)})`)
  try {
    await fontFace.load()
    document.fonts.add(fontFace)
  } catch {
    // Measurement falls back to the next font in the family list.
  }
}

function escapeHtml(text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')
}

interface FieldBox {
  left: number
  top: number
  width: number
  height: number
}

function toFieldBox(pos: { x: number; y: number }, size: { width: number; height: number }): FieldBox {
  return { left: pos.x, top: pos.y, width: size.width, height: size.height }
}

function renderDataMatrixDataUrl(
  inverted: boolean,
  idValue: string,
  dataMatrixWidthPercent: number,
  dataMatrixHeightPercent: number,
  cardWidthPxAtDpi: number,
  cardHeightPxAtDpi: number,
): string {
  const canvas = document.createElement('canvas')
  canvas.width = Math.round(dataMatrixWidthPercent / 100 * cardWidthPxAtDpi)
  canvas.height = Math.round(dataMatrixHeightPercent / 100 * cardHeightPxAtDpi)
  bwipjs.toCanvas(canvas, {
    bcid: 'datamatrix',
    text: idValue || ' ',
    barcolor: inverted ? 'FFFFFF' : '000000',
    backgroundcolor: inverted ? '000000' : 'FFFFFF',
  })
  return canvas.toDataURL()
}

function fieldDivHtml(options: {
  text: string
  fontFamily: string
  box: FieldBox
  fontSizePx: number
  color: string
  align: TextAlign
  borderEnabled?: boolean
  borderColor?: string
  isWrapping?: boolean
  lineHeight?: number
}): string {
  const { text, fontFamily, box, fontSizePx, color, align, borderEnabled, borderColor, isWrapping, lineHeight } = options
  const styleParts = [
    'position:absolute',
    `left:${box.left}%`,
    `top:${box.top}%`,
    `width:${box.width}%`,
    `height:${box.height}%`,
    'display:flex',
    `align-items:${isWrapping ? 'flex-start' : 'center'}`,
    'overflow:hidden',
    isWrapping ? 'white-space:pre-wrap' : 'white-space:nowrap',
    'padding:0 4px',
    `font-family:${fontFamily}`,
    `font-size:${fontSizePx}px`,
    `color:#${color}`,
    `justify-content:${JUSTIFY_CONTENT_BY_ALIGN[align]}`,
  ]
  if (borderEnabled) {
    styleParts.push(`-webkit-text-stroke:1px #${borderColor ?? '000000'}`)
  }
  if (lineHeight != null) {
    styleParts.push(`line-height:${lineHeight}cm`)
  }
  const style = styleParts.join(';')
  return `<div style="${style}">${escapeHtml(text)}</div>`
}

export async function renderBadgeHtml(
  badgeType: BadgeType,
  idValue: string,
  nameValue: string,
  countryValue: string,
  rotate = false,
  dpi = DEFAULT_DPI,
): Promise<string> {
  const cardWidthCss = `${BADGE_WIDTH_CM}cm`
  const cardHeightCss = `${BADGE_HEIGHT_CM}cm`

  const badgeWidthPxAtPrintDpi = badgeWidthPxAtDpi(dpi)
  const badgeHeightPxAtPrintDpi = badgeWidthPxAtPrintDpi / CARD_ASPECT_RATIO

  const idField = badgeType.fields.id
  const nameField = badgeType.fields.name
  const countryField = badgeType.fields.country
  const dataMatrixField = badgeType.fields.datamatrix

  const truncateAt = nameField.truncateAt ?? NAME_MAX_LENGTH
  const displayName = nameValue.length > truncateAt
    ? nameValue.slice(0, truncateAt) + '...'
    : nameValue
  const nameIsWrapping = nameField.wrapAt != null && displayName.length > nameField.wrapAt
  const wrappedDisplayName = nameIsWrapping
    ? displayName.slice(0, nameField.wrapAt!) + '\n' + displayName.slice(nameField.wrapAt!)
    : displayName

  const idBox = toFieldBox(idField.pos, idField.size)
  const nameBox = toFieldBox(nameField.pos, nameField.size)
  const countryBox = toFieldBox(countryField.pos, countryField.size)
  const dataMatrixBox = toFieldBox(dataMatrixField.pos, dataMatrixField.size)

  const dataMatrixDataUrl = dataMatrixField.enabled
    ? renderDataMatrixDataUrl(
        dataMatrixField.inverted,
        idValue,
        dataMatrixBox.width,
        dataMatrixBox.height,
        badgeWidthPxAtPrintDpi,
        badgeHeightPxAtPrintDpi,
      )
    : ''

  function bgImgStyle(fit: BackgroundFit, alignH: string, alignV: string): string {
    if (fit === 'fit-width') {
      const vPos: Record<string, string> = { top: 'top:0', center: 'top:50%;transform:translateY(-50%)', bottom: 'bottom:0' }
      return `position:absolute;width:100%;height:auto;left:0;right:0;${vPos[alignV] ?? vPos.center}`
    }
    if (fit === 'fit-height') {
      const hPos: Record<string, string> = { left: 'left:0', center: 'left:50%;transform:translateX(-50%)', right: 'right:0' }
      return `position:absolute;height:100%;width:auto;top:0;bottom:0;${hPos[alignH] ?? hPos.center}`
    }
    const objectFit: Record<string, string> = { cover: 'cover', contain: 'contain', fill: 'fill' }
    return `position:absolute;inset:0;width:100%;height:100%;object-fit:${objectFit[fit] ?? 'cover'};object-position:${alignH} ${alignV}`
  }

  const alignH = badgeType.backgroundAlignH ?? 'center'
  const alignV = badgeType.backgroundAlignV ?? 'center'
  const backgroundImageHtml = badgeType.backgroundUrl
    ? `<img src="${badgeType.backgroundUrl}" style="${bgImgStyle(badgeType.backgroundFit ?? 'cover', alignH, alignV)}" />`
    : ''

  const fontFaces: string[] = []

  function resolveFontFamily(fontUrl: string, familyName: string, fallback: string): string {
    if (!fontUrl) {
      return fallback
    }
    fontFaces.push(fontFaceHtml(familyName, fontUrl))
    return `'${familyName}', ${fallback}`
  }

  const idFontFamilyName = `badge-font-id-${badgeType.id}`
  const nameFontFamilyName = `badge-font-name-${badgeType.id}`
  const countryFontFamilyName = `badge-font-country-${badgeType.id}`

  const idFontFamily = resolveFontFamily(idField.fontUrl, idFontFamilyName, 'monospace')
  const nameFontFamily = resolveFontFamily(nameField.fontUrl, nameFontFamilyName, 'sans-serif')
  const countryFontFamily = resolveFontFamily(countryField.fontUrl, countryFontFamilyName, 'sans-serif')
  const fontFaceStyleHtml = fontFaces.length > 0 ? `<style>${fontFaces.join('\n')}</style>` : ''

  await Promise.all([
    idField.fontUrl ? loadFontForMeasurement(idFontFamilyName, idField.fontUrl) : Promise.resolve(),
    nameField.fontUrl ? loadFontForMeasurement(nameFontFamilyName, nameField.fontUrl) : Promise.resolve(),
    countryField.fontUrl ? loadFontForMeasurement(countryFontFamilyName, countryField.fontUrl) : Promise.resolve(),
  ])

  const idFontSizePx = fitFontSize(
    idValue,
    idBox.width / 100 * BADGE_WIDTH_PX,
    idBox.height / 100 * BADGE_HEIGHT_PX,
    idFontFamily,
  )
  const nameFontSizePx = nameIsWrapping
    ? fitFontSize(
        [displayName.slice(0, nameField.wrapAt!), displayName.slice(nameField.wrapAt!)].reduce((a, b) => a.length >= b.length ? a : b),
        nameBox.width / 100 * BADGE_WIDTH_PX,
        nameBox.height / 100 * BADGE_HEIGHT_PX / 2,
        nameFontFamily,
      )
    : fitFontSize(
        displayName,
        nameBox.width / 100 * BADGE_WIDTH_PX,
        nameBox.height / 100 * BADGE_HEIGHT_PX,
        nameFontFamily,
      )
  const countryFontSizePx = fitFontSize(
    countryValue,
    countryBox.width / 100 * BADGE_WIDTH_PX,
    countryBox.height / 100 * BADGE_HEIGHT_PX,
    countryFontFamily,
  )

  const cardStyle = [
    'position:relative',
    `width:${cardWidthCss}`,
    `height:${cardHeightCss}`,
    'margin:0 auto',
    'overflow:hidden',
    `background-color:#${badgeType.backgroundColor ?? 'ffffff'}`,
    'print-color-adjust:exact',
    '-webkit-print-color-adjust:exact',
  ].join(';')

  const dataMatrixStyle = [
    'position:absolute',
    `left:${dataMatrixBox.left}%`,
    `top:${dataMatrixBox.top}%`,
    `width:${dataMatrixBox.width}%`,
    `height:${dataMatrixBox.height}%`,
  ].join(';')

  const cardHtml = `
    <div style="${cardStyle}">
      ${backgroundImageHtml}
      ${idField.enabled ? fieldDivHtml({
        text: idValue,
        fontFamily: idFontFamily,
        box: idBox,
        fontSizePx: idFontSizePx,
        color: idField.color,
        align: idField.align,
        borderEnabled: idField.borderEnabled,
        borderColor: idField.borderColor,
      }) : ''}
      ${nameField.enabled ? fieldDivHtml({
        text: wrappedDisplayName,
        fontFamily: nameFontFamily,
        box: nameBox,
        fontSizePx: nameFontSizePx,
        color: nameField.color,
        align: nameField.align,
        borderEnabled: nameField.borderEnabled,
        borderColor: nameField.borderColor,
        isWrapping: nameIsWrapping,
        lineHeight: nameIsWrapping && nameField.wrapLineHeight != null ? nameField.wrapLineHeight / 100 * BADGE_HEIGHT_CM : undefined,
      }) : ''}
      ${countryField.enabled ? fieldDivHtml({
        text: countryValue,
        fontFamily: countryFontFamily,
        box: countryBox,
        fontSizePx: countryFontSizePx,
        color: countryField.color,
        align: countryField.align,
        borderEnabled: countryField.borderEnabled,
        borderColor: countryField.borderColor,
      }) : ''}
      ${dataMatrixField.enabled ? `
      <div style="${dataMatrixStyle}">
        <img src="${dataMatrixDataUrl}" style="width:100%;height:100%" />
      </div>` : ''}
    </div>
  `

  if (!rotate) {
    return `${fontFaceStyleHtml}${cardHtml}`
  }

  const rotatedWrapperStyle = [
    'position:relative',
    `width:${cardHeightCss}`,
    `height:${cardWidthCss}`,
    'margin:0 auto',
  ].join(';')

  const rotatedCardStyle = [
    'position:absolute',
    `width:${cardWidthCss}`,
    `height:${cardHeightCss}`,
    'top:50%',
    'left:50%',
    'transform:translate(-50%, -50%) rotate(90deg)',
  ].join(';')

  return `
    ${fontFaceStyleHtml}
    <div style="${rotatedWrapperStyle}">
      <div style="${rotatedCardStyle}">
        ${cardHtml}
      </div>
    </div>
  `
}
