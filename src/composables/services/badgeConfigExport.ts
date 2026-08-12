import { localBadgeMappingStore } from '@/composables/services/badgeMappingStore'
import { localBadgeTypeStore } from '@/composables/services/badgeTypeStore'
import { localPrintSettingsStore } from '@/composables/services/printSettingsStore'
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
    badgeTypes: localBadgeTypeStore.load(),
    badgeMapping: localBadgeMappingStore.load(),
    printSettings: localPrintSettingsStore.load(),
  }
  const blob = new Blob([JSON.stringify(data)], { type: 'application/json' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = 'badge-config.json'
  link.click()
  URL.revokeObjectURL(url)
}

export async function importBadgeConfig(file: File): Promise<void> {
  const text = await file.text()
  const parsed = JSON.parse(text) as BadgeConfigExport

  const idMap = new Map(parsed.badgeTypes.map((badgeType) => [badgeType.id, crypto.randomUUID()]))
  const withFreshIds = parsed.badgeTypes.map((badgeType) => ({ ...badgeType, id: idMap.get(badgeType.id)! }))
  const currentBadgeTypes = localBadgeTypeStore.load()
  localBadgeTypeStore.save([...currentBadgeTypes, ...withFreshIds])

  const currentMapping = localBadgeMappingStore.load()
  const remappedRules = Object.fromEntries(
    Object.entries(parsed.badgeMapping.rules).map(([key, badgeTypeId]) => [
      key,
      idMap.get(badgeTypeId) ?? badgeTypeId,
    ]),
  )
  localBadgeMappingStore.save({
    packages: [...new Set([...currentMapping.packages, ...parsed.badgeMapping.packages])],
    flags: [...new Set([...currentMapping.flags, ...parsed.badgeMapping.flags])],
    rules: { ...currentMapping.rules, ...remappedRules },
  })

  localPrintSettingsStore.save(parsed.printSettings)
}
