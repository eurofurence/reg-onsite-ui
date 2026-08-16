import { createFetchCache, fetchCached, type FetchCache } from '@/composables/print/fetchCache'
import type { BackgroundAlignH, BackgroundAlignV, BackgroundFit } from '@/types/badgeType'
import type { jsPDF } from 'jspdf'

export interface CachedBackgroundImage {
  bytes: Uint8Array
  format: string
  naturalWidthPx: number
  naturalHeightPx: number
}

export type BackgroundImageCache = FetchCache<CachedBackgroundImage>

export function createBackgroundImageCache(): BackgroundImageCache {
  return createFetchCache()
}

async function fetchBackgroundImage(doc: jsPDF, url: string): Promise<CachedBackgroundImage | null> {
  try {
    const response = await fetch(url)
    if (!response.ok) {
      return null
    }
    const bytes = new Uint8Array(await response.arrayBuffer())
    // getImageProperties sniffs the format (PNG/JPEG/GIF/WEBP/BMP) from magic bytes
    // and reads natural dimensions directly from the encoded data, without decoding
    // through an <img> element.
    const { fileType, width, height } = doc.getImageProperties(bytes)
    return { bytes, format: fileType, naturalWidthPx: width, naturalHeightPx: height }
  } catch {
    return null
  }
}

export async function fetchBackgroundImageCached(
  doc: jsPDF,
  url: string,
  backgroundImageCache: BackgroundImageCache,
): Promise<CachedBackgroundImage | null> {
  return fetchCached(url, backgroundImageCache, (key) => fetchBackgroundImage(doc, key))
}

export interface BackgroundPlacement {
  drawX: number
  drawY: number
  drawWidth: number
  drawHeight: number
  clip: boolean
}

const ALIGN_H_FRACTION: Record<BackgroundAlignH, number> = { left: 0, center: 0.5, right: 1 }
const ALIGN_V_FRACTION: Record<BackgroundAlignV, number> = { top: 0, center: 0.5, bottom: 1 }

// Mirrors backgroundImageAttrs (badgeHtml.ts), which expresses these same 5 fit modes
// via SVG preserveAspectRatio/transform/clipPath, in destination-rect + clip-flag form
// for jsPDF's addImage (which has no source-crop or clip-path support of its own).
export function computeBackgroundPlacement(
  fit: BackgroundFit,
  alignH: BackgroundAlignH,
  alignV: BackgroundAlignV,
  cardWidthPx: number,
  cardHeightPx: number,
  naturalWidthPx: number,
  naturalHeightPx: number,
): BackgroundPlacement {
  if (fit === 'fill') {
    return { drawX: 0, drawY: 0, drawWidth: cardWidthPx, drawHeight: cardHeightPx, clip: false }
  }
  if (fit === 'contain' || fit === 'cover') {
    const scale = fit === 'contain'
      ? Math.min(cardWidthPx / naturalWidthPx, cardHeightPx / naturalHeightPx)
      : Math.max(cardWidthPx / naturalWidthPx, cardHeightPx / naturalHeightPx)
    const drawWidth = naturalWidthPx * scale
    const drawHeight = naturalHeightPx * scale
    const drawX = (cardWidthPx - drawWidth) * ALIGN_H_FRACTION[alignH]
    const drawY = (cardHeightPx - drawHeight) * ALIGN_V_FRACTION[alignV]
    return { drawX, drawY, drawWidth, drawHeight, clip: fit === 'cover' }
  }
  if (fit === 'fit-width') {
    const scale = cardWidthPx / naturalWidthPx
    const drawHeight = naturalHeightPx * scale
    const drawY = (cardHeightPx - drawHeight) * ALIGN_V_FRACTION[alignV]
    return { drawX: 0, drawY, drawWidth: cardWidthPx, drawHeight, clip: true }
  }
  const scale = cardHeightPx / naturalHeightPx
  const drawWidth = naturalWidthPx * scale
  const drawX = (cardWidthPx - drawWidth) * ALIGN_H_FRACTION[alignH]
  return { drawX, drawY: 0, drawWidth, drawHeight: cardHeightPx, clip: true }
}
