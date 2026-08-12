import { ref } from 'vue'
import type { BadgeType } from '@/types/badgeType'

const STORAGE_KEY = 'xpage.badgeTypes'

function isBadgeType(v: unknown): v is BadgeType {
  return typeof v === 'object' && v !== null && typeof (v as BadgeType).name === 'string' && typeof (v as BadgeType).id === 'string'
}

function loadFromStorage(): BadgeType[] {
  const raw = localStorage.getItem(STORAGE_KEY)
  if (!raw) return []
  try {
    const parsed = JSON.parse(raw)
    if (!Array.isArray(parsed)) return []
    return parsed.filter(isBadgeType)
  } catch {
    return []
  }
}

export const badgeTypesRef = ref<BadgeType[]>(loadFromStorage())

export interface BadgeTypeStore {
  load(): BadgeType[]
  save(badgeTypes: BadgeType[]): void
}

export const localBadgeTypeStore: BadgeTypeStore = {
  load() {
    return loadFromStorage()
  },
  save(badgeTypes) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(badgeTypes))
    badgeTypesRef.value = badgeTypes
  },
}
