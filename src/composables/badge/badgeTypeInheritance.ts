import type { BadgeType, CustomBarcodeFieldState, CustomTextFieldState } from '@/types/badgeType'

function findBadgeType(badgeTypes: BadgeType[], badgeTypeId: string): BadgeType | undefined {
  return badgeTypes.find((badgeType) => badgeType.id === badgeTypeId)
}

function mergeById<T extends { id: string }>(parentFields: T[], ownFields: T[]): T[] {
  const ownById = new Map(ownFields.map((field) => [field.id, field]))
  const merged = parentFields.map((field) => ownById.get(field.id) ?? field)
  const parentIds = new Set(parentFields.map((field) => field.id))
  return [...merged, ...ownFields.filter((field) => !parentIds.has(field.id))]
}

export function wouldCreateCycle(badgeTypes: BadgeType[], childId: string, candidateParentId: string): boolean {
  if (candidateParentId === childId) {
    return true
  }
  const visited = new Set<string>()
  let currentId: string | null = candidateParentId
  while (currentId !== null) {
    if (currentId === childId || visited.has(currentId)) {
      return true
    }
    visited.add(currentId)
    currentId = findBadgeType(badgeTypes, currentId)?.parentId ?? null
  }
  return false
}

export function getAvailableParentOptions(badgeTypes: BadgeType[], childId: string): BadgeType[] {
  return badgeTypes.filter((badgeType) => !wouldCreateCycle(badgeTypes, childId, badgeType.id))
}

export function resolveBadgeType(badgeTypes: BadgeType[], badgeTypeId: string): BadgeType {
  const chain: BadgeType[] = []
  const visited = new Set<string>()
  let currentId: string | null = badgeTypeId
  while (currentId !== null && !visited.has(currentId)) {
    const badgeType = findBadgeType(badgeTypes, currentId)
    if (!badgeType) {
      console.error(
        `Badge type "${currentId}" referenced as a parent in the inheritance chain of "${badgeTypeId}" no longer exists. Inherited fields from it and any further ancestors will be missing.`
      )
      break
    }
    chain.push(badgeType)
    visited.add(currentId)
    currentId = badgeType.parentId
  }
  chain.reverse()

  let resolved: BadgeType | null = null
  for (const badgeType of chain) {
    if (!resolved) {
      resolved = badgeType
      continue
    }
    resolved = {
      ...badgeType,
      background: badgeType.inherit.background ? resolved.background : badgeType.background,
      fields: {
        custom: mergeById<CustomTextFieldState>(resolved.fields.custom, badgeType.fields.custom),
        customBarcodes: mergeById<CustomBarcodeFieldState>(resolved.fields.customBarcodes, badgeType.fields.customBarcodes),
      },
    }
  }

  if (!resolved) {
    throw new Error(`Badge type not found: ${badgeTypeId}`)
  }
  return resolved
}
