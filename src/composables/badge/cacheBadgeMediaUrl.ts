import { postCacheMediaUpload } from '@/composables/api/backend/postCacheMediaUpload'
import { postCacheMediaUrl } from '@/composables/api/backend/postCacheMediaUrl'
import { getUrl } from '@/composables/api/base/getUrl'
import type { RestErrorHandler } from '@/composables/api/base/restErrorWrapper'
import { sha256Hex } from '@/composables/badge/sourceHash'

export interface CacheBadgeMediaResult {
  url: string
  cached: boolean
}

async function findExistingCacheUrl(sourceHash: string): Promise<string | undefined> {
  const response = await fetch(getUrl(`onsite/api/v1/media/cache/${sourceHash}`), {
    method: 'GET',
    credentials: 'include',
  })
  if (!response.ok) {
    return undefined
  }
  const resolvedKey = response.headers.get('X-Cache-Key')
  if (!resolvedKey) {
    return undefined
  }
  return getUrl(`onsite/api/v1/media/cache/${resolvedKey}`).toString()
}

export async function cacheBadgeMediaUrl(
  errorHandler: RestErrorHandler,
  sourceUrl: string,
): Promise<CacheBadgeMediaResult> {
  const trimmed = sourceUrl.trim()
  if (!trimmed) {
    return { url: '', cached: true }
  }
  const sourceHash = await sha256Hex(trimmed)
  const existingUrl = await findExistingCacheUrl(sourceHash)
  if (existingUrl !== undefined) {
    return { url: existingUrl, cached: true }
  }
  const cachedUrl = await postCacheMediaUrl(errorHandler, trimmed)
  if (cachedUrl === undefined) {
    return { url: '', cached: false }
  }
  return { url: cachedUrl, cached: true }
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
