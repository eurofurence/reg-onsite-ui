import { postCacheMediaUpload } from '@/composables/api/backend/postCacheMediaUpload'
import { postCacheMediaUrl } from '@/composables/api/backend/postCacheMediaUrl'
import { getUrl } from '@/composables/api/base/getUrl'
import type { RestErrorHandler } from '@/composables/api/base/restErrorWrapper'
import { sha256Hex } from '@/composables/badge/sourceHash'

export interface CacheBadgeMediaResult {
  url: string
  cached: boolean
}

async function findExistingCacheUrls(
  sourceHashes: string[],
): Promise<Map<string, string>> {
  const response = await fetch(getUrl('onsite/api/v1/media/cache/lookup'), {
    method: 'POST',
    credentials: 'include',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ source_hashes: sourceHashes }),
  })
  if (!response.ok) {
    return new Map()
  }
  const { keys }: { keys: Record<string, string> } = await response.json()
  return new Map(
    Object.entries(keys).map(([sourceHash, key]) => [
      sourceHash,
      getUrl(`onsite/api/v1/media/cache/${key}`).toString(),
    ]),
  )
}

export async function cacheBadgeMediaUrl(
  errorHandler: RestErrorHandler,
  sourceUrl: string,
  force = false,
): Promise<CacheBadgeMediaResult> {
  const trimmed = sourceUrl.trim()
  if (!trimmed) {
    return { url: '', cached: true }
  }
  if (!force) {
    const sourceHash = await sha256Hex(trimmed)
    const existingUrls = await findExistingCacheUrls([sourceHash])
    const existingUrl = existingUrls.get(sourceHash)
    if (existingUrl !== undefined) {
      return { url: existingUrl, cached: true }
    }
  }
  const cachedUrl = await postCacheMediaUrl(errorHandler, trimmed, force)
  if (cachedUrl === undefined) {
    return { url: '', cached: false }
  }
  return { url: cachedUrl, cached: true }
}

export async function findCachedBadgeMediaUrls(
  sourceUrls: string[],
): Promise<Map<string, string>> {
  const trimmedUrls = sourceUrls.map((sourceUrl) => sourceUrl.trim()).filter(Boolean)
  const hashes = await Promise.all(trimmedUrls.map((sourceUrl) => sha256Hex(sourceUrl)))
  const hashToUrls = new Map<string, string[]>()
  trimmedUrls.forEach((sourceUrl, index) => {
    const hash = hashes[index]
    const urls = hashToUrls.get(hash) ?? []
    urls.push(sourceUrl)
    hashToUrls.set(hash, urls)
  })
  const existingUrls = await findExistingCacheUrls([...hashToUrls.keys()])
  const result = new Map<string, string>()
  for (const [hash, urls] of hashToUrls) {
    const existingUrl = existingUrls.get(hash)
    if (existingUrl === undefined) continue
    for (const sourceUrl of urls) {
      result.set(sourceUrl, existingUrl)
    }
  }
  return result
}

export async function cacheBadgeMediaUpload(
  errorHandler: RestErrorHandler,
  file: File,
): Promise<CacheBadgeMediaResult> {
  const cachedUrl = await postCacheMediaUpload(errorHandler, file)
  if (cachedUrl === undefined) {
    return { url: '', cached: false }
  }
  return { url: cachedUrl, cached: true }
}
