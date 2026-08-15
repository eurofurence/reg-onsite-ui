import type { RestErrorHandler } from '@/composables/api/base/restErrorWrapper'
import { badgeMappingRef, badgeTypesRef, printSettingsRef, saveBadgeConfig } from '@/composables/services/badgeConfigStore'
import { withNoFlag } from '@/types/badgeMapping'
import type { BadgeMapping } from '@/types/badgeMapping'
import type { BadgeType } from '@/types/badgeType'
import type { PrintSettings } from '@/types/printSettings'

interface BadgeConfigExport {
  badgeTypes: BadgeType[]
  badgeMapping: BadgeMapping
  printSettings: PrintSettings
}

export function exportBadgeConfig(): void {
  const data: BadgeConfigExport = {
    badgeTypes: badgeTypesRef.value,
    badgeMapping: badgeMappingRef.value,
    printSettings: printSettingsRef.value,
  }
  const blob = new Blob([JSON.stringify(data)], { type: 'application/json' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = 'badge-config.json'
  link.click()
  URL.revokeObjectURL(url)
}

function dropDanglingParentIds(badgeTypes: BadgeType[]): BadgeType[] {
  const idSet = new Set(badgeTypes.map((badgeType) => badgeType.id))
  return badgeTypes.map((badgeType) => {
    if (badgeType.parentId !== null && !idSet.has(badgeType.parentId)) {
      console.error(
        `Imported badge type "${badgeType.name}" (${badgeType.id}) references parent "${badgeType.parentId}", which is not part of the imported config. Clearing the parent reference.`
      )
      return { ...badgeType, parentId: null }
    }
    return badgeType
  })
}

export async function importBadgeConfig(file: File, errorHandler: RestErrorHandler): Promise<void> {
  const text = await file.text()
  const parsed = JSON.parse(text) as BadgeConfigExport

  badgeTypesRef.value = dropDanglingParentIds(parsed.badgeTypes)
  badgeMappingRef.value = withNoFlag(parsed.badgeMapping)
  printSettingsRef.value = parsed.printSettings
  await saveBadgeConfig(errorHandler)
}
