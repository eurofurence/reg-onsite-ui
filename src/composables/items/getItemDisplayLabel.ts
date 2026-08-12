import { FROM_SIZE_SUFFIX, isFromSizeItem } from '@/composables/items/fromSizeUtils'
import { getGoodieLabel } from '@/composables/items/getGoodieLabel'
import { getConventionSetup } from '@/composables/logic/getConventionSetup'
import type { ConcreteGoodieValue } from '@/config/convention'

export function getItemDisplayLabel(item: ConcreteGoodieValue): string {
  if (isFromSizeItem(item)) {
    const record = getConventionSetup().metadata.forAbstractGoodies.record as Record<string, { label: string } | null>
    const abstractValue = item.slice(0, -FROM_SIZE_SUFFIX.length)
    return `${record[abstractValue]?.label ?? abstractValue} (from attendee size)`
  }
  return getGoodieLabel(item)
}
