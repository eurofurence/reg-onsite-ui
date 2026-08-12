<script setup lang="ts">
import Badge from '@/volt/Badge.vue'
import Button from '@/volt/Button.vue'
import { computed, ref, watch } from 'vue'
import BadgeDesigner from '@/components/badge/BadgeDesigner.vue'
import { localBadgeTypeStore } from '@/composables/services/badgeTypeStore'
import { badgeMappingRef } from '@/composables/services/badgeMappingStore'
import { NO_FLAG } from '@/types/badgeMapping'
import { renderBadgeHtml } from '@/composables/print/badgeHtml'
import { printBadgePages } from '@/composables/print/printFrame'
import { localPrintSettingsStore } from '@/composables/services/printSettingsStore'
import { buildPageSizeCss, getOrientedPageDimensionsMm } from '@/types/printSettings'
import { createDefaultBadgeType } from '@/types/badgeType'
import type { BadgeType, BadgeTypeFields } from '@/types/badgeType'

const storedBadgeTypes = localBadgeTypeStore.load()
const badgeTypes = ref<BadgeType[]>(
  storedBadgeTypes.length > 0 ? storedBadgeTypes : [createDefaultBadgeType('Attendee Badge')],
)
const selectedId = ref<string | null>(badgeTypes.value[0]?.id ?? null)

const previewIdValue = ref('1234S')
const previewNameValue = ref('John Doe')
const previewCountryValue = ref('Germany')

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

watch(badgeTypes, (value) => {
  localBadgeTypeStore.save(value)
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

async function previewAll() {
  const printSettings = localPrintSettingsStore.load()
  const pages: string[] = []
  for (const badgeType of badgeTypes.value) {
    const html = await renderBadgeHtml(
      badgeType,
      previewIdValue.value,
      previewNameValue.value,
      previewCountryValue.value,
      printSettings.orientation === 'portrait',
      printSettings.dpi,
    )
    pages.push(html)
    if (printSettings.doubleSided) pages.push(html)
  }
  const pageDimensions = getOrientedPageDimensionsMm(printSettings)
  printBadgePages(pages, buildPageSizeCss(printSettings), pageDimensions.width, pageDimensions.height)
}

function deleteBadgeType(id: string) {
  const badgeType = badgeTypes.value.find((item) => item.id === id)
  if (!badgeType || !confirm(`Delete badge type "${badgeType.name}"?`)) {
    return
  }
  badgeTypes.value = badgeTypes.value.filter((item) => item.id !== id)
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

function applyFieldsToAll(fields: BadgeTypeFields) {
  badgeTypes.value = badgeTypes.value.map(bt => ({ ...bt, fields }))
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
      <BadgeDesigner
        v-if="selectedBadgeType"
        v-model="selectedBadgeType"
        v-model:id-value="previewIdValue"
        v-model:name-value="previewNameValue"
        v-model:country-value="previewCountryValue"
        :key="selectedBadgeType.id"
        @apply-to-all="applyFieldsToAll"
      />
      <p v-else class="text-sm text-slate-500">No badge types yet.</p>
    </div>
  </div>
</template>
