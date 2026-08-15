import * as bwipjs from 'bwip-js/browser'

export interface BarcodeStyleOption {
  value: string
  label: string
}

const SAMPLE_ID_VALUE = 'AB1234'

function canRenderBadgeId(bcid: string): boolean {
  try {
    bwipjs.toSVG({ bcid, text: SAMPLE_ID_VALUE })
    return true
  } catch {
    return false
  }
}

let cachedBarcodeStyleOptions: BarcodeStyleOption[] | null = null

// Probing every bwipjs symbol (~90+) is real synchronous work; computing it
// lazily on first access (instead of at module load) keeps it off the
// critical path before the badge designer even mounts, and the result is
// memoized since the symbol list never changes at runtime.
export function getBarcodeStyleOptions(): BarcodeStyleOption[] {
  if (!cachedBarcodeStyleOptions) {
    cachedBarcodeStyleOptions = bwipjs.symbolList
      .filter((symbol) => canRenderBadgeId(symbol.bcid))
      .map((symbol) => ({
        value: symbol.bcid,
        label: symbol.desc,
      }))
  }
  return cachedBarcodeStyleOptions
}

const SQUARE_EPSILON = 0.5

export function isBarcodeStyleSquare(style: string, sampleText: string): boolean {
  try {
    const svg = bwipjs.toSVG({ bcid: style, text: sampleText || ' ' })
    const viewBoxMatch = /viewBox="([^"]+)"/.exec(svg)
    if (!viewBoxMatch) {
      return false
    }
    const parts = (viewBoxMatch[1] ?? '').trim().split(/\s+/).map(Number)
    const width = parts[2]
    const height = parts[3]
    if (width == null || height == null) {
      return false
    }
    return Math.abs(width - height) < SQUARE_EPSILON
  } catch {
    return false
  }
}
