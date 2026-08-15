<script setup lang="ts">
import Button from '@/volt/Button.vue'
import InputText from '@/volt/InputText.vue'
import Select from '@/volt/Select.vue'
import Toolbar from '@/volt/Toolbar.vue'
import { computed, ref, watch } from 'vue'
import { resolveBadgeType } from '@/composables/badge/badgeTypeInheritance'
import { renderBadgeSvg } from '@/composables/print/badgeHtml'
import { printBadgePages } from '@/composables/print/printFrame'
import { badgeMappingRef, badgeTypesRef, printSettingsRef } from '@/composables/services/badgeConfigStore'
import { localPrintRowStore } from '@/composables/services/printRowStore'
import { NO_FLAG, mappingKey } from '@/types/badgeMapping'
import { createEmptyPrintRow } from '@/types/printRow'
import { buildPageSizeCss, getOrientedPageDimensionsMm } from '@/types/printSettings'
import type { PrintRow } from '@/types/printRow'
import type { BadgeType, CustomFieldSource, CustomTextFieldState } from '@/types/badgeType'

const badgeTypes = badgeTypesRef
const badgeMapping = badgeMappingRef
const printRows = ref<PrintRow[]>(localPrintRowStore.load())
const pasteTargetBadgeTypeId = ref<string | null>(badgeTypes.value[0]?.id ?? null)
const printErrorMessage = ref<string | null>(null)

watch(printRows, (value) => {
  localPrintRowStore.save(value)
}, { deep: true })

function badgeTypeFor(row: PrintRow): BadgeType | undefined {
  return badgeTypes.value.find((badgeType) => badgeType.id === row.badgeTypeId)
}

const unresolvedRowCount = computed(
  () => printRows.value.filter((row) => badgeTypeFor(row) === undefined).length,
)

const visibleCustomFields = computed<CustomTextFieldState[]>(() => {
  const seen = new Map<string, CustomTextFieldState>()
  for (const badgeType of badgeTypes.value) {
    const resolved = resolveBadgeType(badgeTypes.value, badgeType.id)
    for (const field of resolved.fields.custom) {
      if (field.source.kind === 'attendee' && !seen.has(field.id)) {
        seen.set(field.id, field)
      }
    }
  }
  return [...seen.values()]
})

function resolveSourceValue(source: CustomFieldSource, row: PrintRow, fieldId: string): string {
  switch (source.kind) {
    case 'id': return row.idValue
    case 'nickname': return row.nicknameValue
    case 'country': return row.countryValue
    case 'static': return source.text
    case 'attendee': return row.customValues[fieldId] ?? ''
  }
}

function fieldValuesFor(row: PrintRow, badgeType: BadgeType): Record<string, string> {
  const resolved = resolveBadgeType(badgeTypes.value, badgeType.id)
  const fieldValues: Record<string, string> = {}
  for (const field of resolved.fields.custom) {
    fieldValues[field.id] = resolveSourceValue(field.source, row, field.id)
  }
  for (const field of resolved.fields.customBarcodes) {
    fieldValues[field.id] = resolveSourceValue(field.source, row, field.id)
  }
  return fieldValues
}

function applyMapping(row: PrintRow) {
  row.badgeTypeId = badgeMapping.value.rules[mappingKey(row.packageValue, row.flagValue)] ?? ''
}

function addRow() {
  if (!pasteTargetBadgeTypeId.value) {
    return
  }
  printRows.value.push({
    ...createEmptyPrintRow(pasteTargetBadgeTypeId.value),
    flagValue: NO_FLAG,
  })
}

function deleteRow(id: string) {
  printRows.value = printRows.value.filter((row) => row.id !== id)
}

function clearRows() {
  if (printRows.value.length === 0 || !confirm('Clear all rows?')) {
    return
  }
  printRows.value = []
}

function splitDelimitedLine(line: string, delimiter: string): string[] {
  const fields: string[] = []
  let field = ''
  let inQuotes = false
  for (let index = 0; index < line.length; index += 1) {
    const char = line[index]
    if (inQuotes) {
      if (char === '"') {
        if (line[index + 1] === '"') {
          field += '"'
          index += 1
        } else {
          inQuotes = false
        }
      } else {
        field += char
      }
    } else if (char === '"' && field.length === 0) {
      inQuotes = true
    } else if (char === delimiter) {
      fields.push(field)
      field = ''
    } else {
      field += char
    }
  }
  fields.push(field)
  return fields
}

async function pasteRows() {
  if (!pasteTargetBadgeTypeId.value) {
    return
  }
  const text = await navigator.clipboard.readText()
  const badgeTypeId = pasteTargetBadgeTypeId.value
  const lines = text
    .split('\n')
    .map((line) => line.trim())
    .filter((line) => line.length > 0)
  const delimiter = lines[0]?.includes('\t') ? '\t' : ','
  const rows = lines.map((line) => {
    const [idValue = '', nicknameValue = '', countryValue = ''] = splitDelimitedLine(line, delimiter)
    return {
      ...createEmptyPrintRow(badgeTypeId),
      idValue: idValue.trim(),
      nicknameValue: nicknameValue.trim(),
      countryValue: countryValue.trim(),
      flagValue: NO_FLAG,
    }
  })
  printRows.value.push(...rows)
}

function rowsToCsv(): string {
  return printRows.value
    .map((row) => [row.idValue, row.nicknameValue, row.countryValue].join(','))
    .join('\n')
}

async function copyRows() {
  await navigator.clipboard.writeText(rowsToCsv())
}

function downloadRows() {
  const blob = new Blob([rowsToCsv()], { type: 'text/csv' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = 'print-rows.csv'
  link.click()
  URL.revokeObjectURL(url)
}

async function printBadges() {
  printErrorMessage.value = null
  const printSettings = printSettingsRef.value
  const rowsWithBadgeType = printRows.value
    .map((row) => ({ row, badgeType: badgeTypeFor(row) }))
    .filter((entry): entry is { row: PrintRow; badgeType: BadgeType } => entry.badgeType !== undefined)
  const svgs = await Promise.all(
    rowsWithBadgeType.map(({ row, badgeType }) =>
      renderBadgeSvg(
        resolveBadgeType(badgeTypes.value, badgeType.id),
        fieldValuesFor(row, badgeType),
        printSettings.cardWidthMm,
        printSettings.cardHeightMm,
        printSettings.dpi,
      ),
    ),
  )
  const pages = printSettings.doubleSided ? svgs.flatMap((svg) => [svg, svg]) : svgs
  const pageDimensions = getOrientedPageDimensionsMm(printSettings)
  try {
    await printBadgePages(
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
  } catch {
    printErrorMessage.value = 'Failed to print badges. Please try again.'
  }
}
</script>

<template>
  <div class="flex flex-col gap-6 p-8">
    <p v-if="unresolvedRowCount > 0" class="text-sm text-red-600">
      {{ unresolvedRowCount }} row(s) have no Badge Type selected and will be skipped when printing.
    </p>
    <p v-if="printErrorMessage" class="text-sm text-red-600">{{ printErrorMessage }}</p>

    <Toolbar>
      <template #start>
        <div class="flex items-center gap-3">
          <Select
            v-model="pasteTargetBadgeTypeId"
            :options="badgeTypes"
            option-label="name"
            option-value="id"
            placeholder="Badge Type for new rows"
            class="w-56"
          />
          <Button icon="pi pi-plus" aria-label="Add Row" v-tooltip.bottom="'Add Row'" @click="addRow" />
          <Button icon="pi pi-clipboard" severity="secondary" aria-label="Paste Rows" v-tooltip.bottom="'Paste Rows'" @click="pasteRows" />
          <Button icon="pi pi-copy" severity="secondary" aria-label="Copy Rows" v-tooltip.bottom="'Copy Rows'" @click="copyRows" />
          <Button icon="pi pi-download" severity="secondary" aria-label="Download Rows" v-tooltip.bottom="'Download Rows'" @click="downloadRows" />
        </div>
      </template>
      <template #center>
        <Button icon="pi pi-print" label="Print" v-tooltip.bottom="'Print'" @click="printBadges" />
      </template>
      <template #end>
        <Button icon="pi pi-trash" severity="danger" aria-label="Clear Rows" v-tooltip.bottom="'Clear Rows'" @click="clearRows" />
      </template>
    </Toolbar>

    <table class="text-sm text-slate-700">
      <thead>
        <tr class="text-left text-slate-500">
          <th class="pr-4 font-normal">ID</th>
          <th class="pr-4 font-normal">Nickname</th>
          <th class="pr-4 font-normal">Country</th>
          <th class="pr-4 font-normal">Package</th>
          <th class="pr-4 font-normal">Flag</th>
          <th class="pr-4 font-normal">Badge Type</th>
          <th v-for="field in visibleCustomFields" :key="field.id" class="pr-4 font-normal">{{ field.label }}</th>
          <th class="pr-4 font-normal"></th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="row in printRows" :key="row.id">
          <td class="pr-4 py-1">
            <InputText v-model="row.idValue" class="p-1" />
          </td>
          <td class="pr-4">
            <InputText v-model="row.nicknameValue" class="p-1" />
          </td>
          <td class="pr-4">
            <InputText v-model="row.countryValue" class="p-1" />
          </td>
          <td class="pr-4">
            <Select
              :model-value="row.packageValue"
              :options="badgeMapping.packages"
              placeholder="None"
              class="w-40"
              @update:model-value="(value: string | null) => { row.packageValue = value ?? ''; applyMapping(row) }"
            />
          </td>
          <td class="pr-4">
            <Select
              :model-value="row.flagValue"
              :options="badgeMapping.flags"
              placeholder="None"
              class="w-40"
              @update:model-value="(value: string | null) => { row.flagValue = value ?? ''; applyMapping(row) }"
            />
          </td>
          <td class="pr-4">
            <Select
              v-model="row.badgeTypeId"
              :options="badgeTypes"
              option-label="name"
              option-value="id"
              class="w-48"
            />
          </td>
          <td v-for="field in visibleCustomFields" :key="field.id" class="pr-4">
            <InputText :model-value="row.customValues[field.id] ?? ''" class="p-1" @update:model-value="(value: string) => { row.customValues[field.id] = value }" />
          </td>
          <td class="pr-4">
            <Button severity="danger" aria-label="Delete" v-tooltip.bottom="'Delete Row'" icon="pi pi-trash" @click="deleteRow(row.id)" />
          </td>
        </tr>
      </tbody>
    </table>
  </div>
</template>
