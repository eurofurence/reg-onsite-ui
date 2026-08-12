export type PageSize = 'A4' | 'Letter' | 'Legal' | 'CreditCard'

export const PAGE_SIZE_DIMENSIONS_MM: Record<PageSize, { width: number; height: number }> = {
  A4: { width: 210, height: 297 },
  Letter: { width: 215.9, height: 279.4 },
  Legal: { width: 215.9, height: 355.6 },
  CreditCard: { width: 85.6, height: 54 },
}
export type Orientation = 'portrait' | 'landscape'

export type Dpi = 150 | 300 | 600 | 1200

export interface PrintSettings {
  pageSize: PageSize
  orientation: Orientation
  doubleSided: boolean
  dpi: Dpi
}

export function createDefaultPrintSettings(): PrintSettings {
  return {
    pageSize: 'A4',
    orientation: 'portrait',
    doubleSided: false,
    dpi: 600,
  }
}

export function getOrientedPageDimensionsMm(printSettings: PrintSettings): { width: number; height: number } {
  const { pageSize, orientation } = printSettings
  const dimensionsMm = PAGE_SIZE_DIMENSIONS_MM[pageSize]
  const [width, height] = [dimensionsMm.width, dimensionsMm.height].sort((a, b) => a - b) as [number, number]
  return orientation === 'landscape' ? { width: height, height: width } : { width, height }
}

export function buildPageSizeCss(printSettings: PrintSettings): string {
  const { width, height } = getOrientedPageDimensionsMm(printSettings)
  return `${width}mm ${height}mm`
}
