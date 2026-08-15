export type PageSize =
  | 'A4'
  | 'Letter'
  | 'Legal'
  | 'CreditCard'
  | 'Custom'
export type PresetPageSize = Exclude<PageSize, 'Custom'>

export const PAGE_SIZE_DIMENSIONS_MM: Record<PresetPageSize, { width: number; height: number }> = {
  A4: { width: 210, height: 297 },
  Letter: { width: 215.9, height: 279.4 },
  Legal: { width: 215.9, height: 355.6 },
  CreditCard: { width: 85.6, height: 54 },
}
export type Orientation = 'portrait' | 'landscape'

export type Dpi = 150 | 300 | 600 | 1200

export type CardRotationDeg = 0 | 90 | 180 | 270

export interface PrintSettings {
  pageSize: PageSize
  customPageWidthMm: number
  customPageHeightMm: number
  orientation: Orientation
  doubleSided: boolean
  backSideRotated180: boolean
  dpi: Dpi
  cardWidthMm: number
  cardHeightMm: number
  cardXMm: number
  cardYMm: number
  cardRotationDeg: CardRotationDeg
  cardBorderRadiusMm: number
}

export const DEFAULT_CARD_WIDTH_MM = 85.6
export const DEFAULT_CARD_HEIGHT_MM = 54
export const DEFAULT_CARD_BORDER_RADIUS_MM = 3.2

export function createDefaultPrintSettings(): PrintSettings {
  const defaultPage = PAGE_SIZE_DIMENSIONS_MM.A4
  return {
    pageSize: 'A4',
    customPageWidthMm: defaultPage.width,
    customPageHeightMm: defaultPage.height,
    orientation: 'portrait',
    doubleSided: false,
    backSideRotated180: false,
    dpi: 600,
    cardWidthMm: DEFAULT_CARD_WIDTH_MM,
    cardHeightMm: DEFAULT_CARD_HEIGHT_MM,
    cardXMm: (defaultPage.width - DEFAULT_CARD_WIDTH_MM) / 2,
    cardYMm: (defaultPage.height - DEFAULT_CARD_HEIGHT_MM) / 2,
    cardRotationDeg: 0,
    cardBorderRadiusMm: 3.2,
  }
}

export function getOrientedPageDimensionsMm(printSettings: PrintSettings): { width: number; height: number } {
  const { pageSize, orientation } = printSettings
  const base = pageSize === 'Custom'
    ? { width: printSettings.customPageWidthMm, height: printSettings.customPageHeightMm }
    : PAGE_SIZE_DIMENSIONS_MM[pageSize]
  return orientation === 'landscape'
    ? { width: Math.max(base.width, base.height), height: Math.min(base.width, base.height) }
    : { width: Math.min(base.width, base.height), height: Math.max(base.width, base.height) }
}

export function buildPageSizeCss(printSettings: PrintSettings): string {
  const { width, height } = getOrientedPageDimensionsMm(printSettings)
  return `${width}mm ${height}mm`
}
