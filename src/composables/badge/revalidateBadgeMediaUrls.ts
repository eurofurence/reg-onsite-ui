import { cacheBadgeMediaUrl, findCachedBadgeMediaUrls } from '@/composables/badge/cacheBadgeMediaUrl'
import type { RestErrorHandler } from '@/composables/api/base/restErrorWrapper'
import type { BadgeType, BadgeTypeBackground, CustomTextFieldState } from '@/types/badgeType'

interface MediaUrlHolder {
  getUrl(): string
  setUrl(value: string): void
  getUserUrl(): string
  setUserUrl(value: string): void
}

function backgroundHolder(background: BadgeTypeBackground): MediaUrlHolder {
  return {
    getUrl: () => background.url,
    setUrl: (value) => { background.url = value },
    getUserUrl: () => background.userUrl,
    setUserUrl: (value) => { background.userUrl = value },
  }
}

function fontHolder(field: CustomTextFieldState): MediaUrlHolder {
  return {
    getUrl: () => field.fontUrl,
    setUrl: (value) => { field.fontUrl = value },
    getUserUrl: () => field.userFontUrl,
    setUserUrl: (value) => { field.userFontUrl = value },
  }
}

function migrateMissingUserUrl(holder: MediaUrlHolder): void {
  if (holder.getUserUrl() === undefined || holder.getUserUrl() === null) {
    holder.setUserUrl(holder.getUrl())
    holder.setUrl('')
  }
}

function collectHolders(badgeTypes: BadgeType[]): MediaUrlHolder[] {
  const holders: MediaUrlHolder[] = badgeTypes.map((badgeType) => backgroundHolder(badgeType.background))
  for (const badgeType of badgeTypes) {
    holders.push(...badgeType.fields.custom.map(fontHolder))
  }
  return holders
}

async function isUrlReachable(url: string): Promise<boolean> {
  try {
    const response = await fetch(url, { method: 'GET' })
    return response.ok
  } catch {
    return false
  }
}

export async function forceRefreshBadgeMediaCache(
  badgeTypes: BadgeType[],
  errorHandler: RestErrorHandler,
): Promise<void> {
  const holders = collectHolders(badgeTypes)
  for (const holder of holders) {
    migrateMissingUserUrl(holder)
  }

  for (const holder of holders) {
    const userUrl = holder.getUserUrl()
    if (!userUrl) continue
    const result = await cacheBadgeMediaUrl(errorHandler, userUrl, true)
    if (result.cached) {
      holder.setUrl(result.url)
    }
  }
}

export async function revalidateBadgeMediaUrls(
  badgeTypes: BadgeType[],
  errorHandler: RestErrorHandler,
): Promise<void> {
  const holders = collectHolders(badgeTypes)
  for (const holder of holders) {
    migrateMissingUserUrl(holder)
  }

  const unreachableHolders: MediaUrlHolder[] = []
  for (const holder of holders) {
    const userUrl = holder.getUserUrl()
    if (!userUrl) continue
    const url = holder.getUrl()
    if (url && (await isUrlReachable(url))) continue
    unreachableHolders.push(holder)
  }

  const cachedUrls = await findCachedBadgeMediaUrls(
    unreachableHolders.map((holder) => holder.getUserUrl()),
  )

  for (const holder of unreachableHolders) {
    const userUrl = holder.getUserUrl()
    const cachedUrl = cachedUrls.get(userUrl)
    if (cachedUrl !== undefined) {
      holder.setUrl(cachedUrl)
      continue
    }
    const result = await cacheBadgeMediaUrl(errorHandler, userUrl)
    if (result.cached) {
      holder.setUrl(result.url)
    }
  }
}
