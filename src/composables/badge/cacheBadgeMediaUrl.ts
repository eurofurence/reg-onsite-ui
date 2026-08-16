import { postCacheMediaUpload } from '@/composables/api/backend/postCacheMediaUpload'
import { postCacheMediaUrl } from '@/composables/api/backend/postCacheMediaUrl'
import type { RestErrorHandler } from '@/composables/api/base/restErrorWrapper'

export interface CacheBadgeMediaResult {
  url: string
  cached: boolean
}

export async function cacheBadgeMediaUrl(
  errorHandler: RestErrorHandler,
  sourceUrl: string,
): Promise<CacheBadgeMediaResult> {
  const trimmed = sourceUrl.trim()
  if (!trimmed) {
    return { url: '', cached: true }
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
