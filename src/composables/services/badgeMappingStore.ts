import { ref } from 'vue'
import { NO_FLAG, createEmptyBadgeMapping } from '@/types/badgeMapping'
import type { BadgeMapping } from '@/types/badgeMapping'

const STORAGE_KEY = 'xpage.badgeMapping'

export interface BadgeMappingStore {
  load(): BadgeMapping
  save(badgeMapping: BadgeMapping): void
}

function withNoFlag(badgeMapping: BadgeMapping): BadgeMapping {
  if (badgeMapping.flags.includes(NO_FLAG)) {
    return badgeMapping
  }
  return { ...badgeMapping, flags: [NO_FLAG, ...badgeMapping.flags] }
}

function loadFromStorage(): BadgeMapping {
  const raw = localStorage.getItem(STORAGE_KEY)
  if (!raw) {
    return createEmptyBadgeMapping()
  }
  try {
    return withNoFlag(JSON.parse(raw) as BadgeMapping)
  } catch {
    return createEmptyBadgeMapping()
  }
}

export const badgeMappingRef = ref<BadgeMapping>(loadFromStorage())

export const localBadgeMappingStore: BadgeMappingStore = {
  load() {
    return loadFromStorage()
  },
  save(badgeMapping) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(badgeMapping))
    badgeMappingRef.value = badgeMapping
  },
}
