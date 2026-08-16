import { createFetchCache, fetchCached, type FetchCache } from '@/composables/print/fetchCache'

export type FontBufferCache = FetchCache<ArrayBuffer>

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

export function createFontBufferCache(): FontBufferCache {
  return createFetchCache()
}

export async function fetchFontBufferCached(
  fontUrl: string,
  fontBufferCache: FontBufferCache,
): Promise<ArrayBuffer | null> {
  return fetchCached(fontUrl, fontBufferCache, fetchFontBuffer)
}
