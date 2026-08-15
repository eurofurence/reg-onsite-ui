<script setup lang="ts">
import Badge from '@/volt/Badge.vue'
import Button from '@/volt/Button.vue'
import { computed, ref, watch } from 'vue'
import BadgeDesigner from '@/components/badge/BadgeDesigner.vue'
import { getAvailableParentOptions, resolveBadgeType } from '@/composables/badge/badgeTypeInheritance'
import type { RestErrorHandler } from '@/composables/api/base/restErrorWrapper'
import { badgeMappingRef, badgeTypesRef, printSettingsRef, saveBadgeConfig } from '@/composables/services/badgeConfigStore'
import { NO_FLAG } from '@/types/badgeMapping'
import { renderBadgeSvg } from '@/composables/print/badgeHtml'
import { printBadgePages } from '@/composables/print/printFrame'
import { buildPageSizeCss, getOrientedPageDimensionsMm } from '@/types/printSettings'
import { createDefaultBadgeType, createDefaultFieldInheritance } from '@/types/badgeType'
import type { BadgeType, CustomFieldSource } from '@/types/badgeType'

const props = defineProps<{ errorHandler: RestErrorHandler }>()

const badgeTypes = badgeTypesRef
const selectedId = ref<string | null>(badgeTypes.value[0]?.id ?? null)

watch(badgeTypes, (value) => {
  if (selectedId.value === null || !value.some((badgeType) => badgeType.id === selectedId.value)) {
    selectedId.value = value[0]?.id ?? null
  }
})

const previewIdValue = ref('1234S')
const previewNicknameValue = ref('John Doe')
const previewCountryValue = ref('Germany')
const previewCustomValues = ref<Record<string, string>>({})

const availableParentOptions = computed(() =>
  selectedId.value ? getAvailableParentOptions(badgeTypes.value, selectedId.value) : [],
)

const mappingCountByTypeId = computed(() => {
  const counts: Record<string, number> = {}
  for (const id of Object.values(badgeMappingRef.value.rules)) {
    if (id) counts[id] = (counts[id] ?? 0) + 1
  }
  return counts
})

const mappingTooltipByTypeId = computed(() => {
  const labels: Record<string, string[]> = {}
  for (const [key, id] of Object.entries(badgeMappingRef.value.rules)) {
    if (!id) continue
    const sep = key.indexOf('::')
    const pkg = key.slice(0, sep)
    const flag = key.slice(sep + 2)
    ;(labels[id] ??= []).push(flag === NO_FLAG ? pkg : `${pkg} + ${flag}`)
  }
  return labels
})

watch(badgeTypes, () => {
  saveBadgeConfig(props.errorHandler)
}, { deep: true })

const sortedBadgeTypes = computed(() =>
  [...badgeTypes.value].sort((a, b) => a.name.localeCompare(b.name)),
)

const selectedBadgeType = computed({
  get() {
    return badgeTypes.value.find((badgeType) => badgeType.id === selectedId.value) ?? null
  },
  set(value: BadgeType) {
    const index = badgeTypes.value.findIndex((badgeType) => badgeType.id === value.id)
    if (index !== -1) {
      badgeTypes.value[index] = value
    }
  },
})

function addBadgeType() {
  const badgeType = createDefaultBadgeType('New Badge')
  badgeTypes.value.push(badgeType)
  selectedId.value = badgeType.id
}

function duplicateBadgeType(id: string) {
  const source = badgeTypes.value.find((badgeType) => badgeType.id === id)
  if (!source) {
    return
  }
  const copy: BadgeType = {
    ...source,
    id: crypto.randomUUID(),
    name: `${source.name} Copy`,
  }
  badgeTypes.value.push(copy)
  selectedId.value = copy.id
}

function selectBadgeType(id: string) {
  selectedId.value = id
}

function resolveSourceValue(source: CustomFieldSource, fieldId: string): string {
  switch (source.kind) {
    case 'id': return previewIdValue.value
    case 'nickname': return previewNicknameValue.value
    case 'country': return previewCountryValue.value
    case 'static': return source.text
    case 'attendee': return previewCustomValues.value[fieldId] ?? ''
  }
}

function previewFieldValues(resolved: BadgeType): Record<string, string> {
  const fieldValues: Record<string, string> = {}
  for (const field of resolved.fields.custom) {
    fieldValues[field.id] = resolveSourceValue(field.source, field.id)
  }
  for (const field of resolved.fields.customBarcodes) {
    fieldValues[field.id] = resolveSourceValue(field.source, field.id)
  }
  return fieldValues
}

async function previewAll() {
  const printSettings = printSettingsRef.value
  const pages: string[] = []
  for (const badgeType of badgeTypes.value) {
    const resolved = resolveBadgeType(badgeTypes.value, badgeType.id)
    const svg = await renderBadgeSvg(
      resolved,
      previewFieldValues(resolved),
      printSettings.cardWidthMm,
      printSettings.cardHeightMm,
      printSettings.dpi,
    )
    pages.push(svg)
    if (printSettings.doubleSided) pages.push(svg)
  }
  const pageDimensions = getOrientedPageDimensionsMm(printSettings)
  printBadgePages(
    pages,
    buildPageSizeCss(printSettings),
    pageDimensions.width,
    pageDimensions.height,
    printSettings.cardXMm,
    printSettings.cardYMm,
    printSettings.cardWidthMm,
    printSettings.cardHeightMm,
    printSettings.cardRotationDeg,
    printSettings.backSideRotated180,
    printSettings.cardBorderRadiusMm,
  )
}

function deleteBadgeType(id: string) {
  const badgeType = badgeTypes.value.find((item) => item.id === id)
  if (!badgeType) {
    return
  }
  const mappingCount = mappingCountByTypeId.value[id] ?? 0
  const warning = mappingCount > 0
    ? ` ${mappingCount} mapping rule(s) currently assign attendees to this badge type; they will be cleared.`
    : ''
  if (!confirm(`Delete badge type "${badgeType.name}"?${warning}`)) {
    return
  }
  badgeTypes.value = badgeTypes.value
    .filter((item) => item.id !== id)
    .map((item) => item.parentId === id
      ? { ...item, parentId: null, inherit: createDefaultFieldInheritance() }
      : item)
  if (mappingCount > 0) {
    const rules = { ...badgeMappingRef.value.rules }
    for (const key of Object.keys(rules)) {
      if (rules[key] === id) delete rules[key]
    }
    badgeMappingRef.value = { ...badgeMappingRef.value, rules }
    saveBadgeConfig(props.errorHandler)
  }
  if (selectedId.value === id) {
    selectedId.value = badgeTypes.value[0]?.id ?? null
  }
}

function duplicateSelected() {
  if (selectedId.value) duplicateBadgeType(selectedId.value)
}

function deleteSelected() {
  if (selectedId.value) deleteBadgeType(selectedId.value)
}
</script>

<template>
  <div class="flex gap-6 p-8">
    <div class="flex w-72 flex-shrink-0 flex-col gap-2">
      <h1 class="text-lg font-semibold text-slate-800">Badge Types</h1>
      <ul class="flex flex-col gap-1">
        <li
          v-for="badgeType in sortedBadgeTypes"
          :key="badgeType.id"
          class="flex items-center gap-1 rounded px-2 py-1"
          :class="badgeType.id === selectedId ? 'bg-slate-200' : 'hover:bg-slate-100'"
        >
          <button
            type="button"
            class="flex-1 truncate text-left text-sm text-slate-700"
            @pointerdown="selectBadgeType(badgeType.id)"
            @click="selectBadgeType(badgeType.id)"
          >
            {{ badgeType.name }}
          </button>
          <Badge
            v-if="mappingCountByTypeId[badgeType.id]"
            :value="mappingCountByTypeId[badgeType.id]"
            severity="secondary"
            size="small"
            v-tooltip="{ value: (mappingTooltipByTypeId[badgeType.id] ?? []).join('<br>'), escape: false }"
          />
        </li>
      </ul>
      <Button label="Add Badge Type" size="small" @click="addBadgeType" />
      <Button label="Duplicate Badge Type" size="small" severity="secondary" :disabled="!selectedId" @click="duplicateSelected" />
      <Button label="Delete Badge Type" size="small" severity="danger" :disabled="!selectedId || badgeTypes.length <= 1" @click="deleteSelected" />
      <Button label="Preview All" size="small" severity="secondary" @click="previewAll" />
    </div>

    <div class="flex-1">
      <template v-if="selectedBadgeType">
        <BadgeDesigner
          v-model="selectedBadgeType"
          v-model:id-value="previewIdValue"
          v-model:nickname-value="previewNicknameValue"
          v-model:country-value="previewCountryValue"
          v-model:custom-values="previewCustomValues"
          :badge-types="badgeTypes"
          :available-parent-options="availableParentOptions"
          :key="selectedBadgeType.id"
        />
      </template>
      <p v-else class="text-sm text-slate-500">No badge types yet.</p>
    </div>
  </div>
</template>
