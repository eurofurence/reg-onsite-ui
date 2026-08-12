<script setup lang="ts">
import Button from '@/volt/Button.vue'
import InputText from '@/volt/InputText.vue'
import Select from '@/volt/Select.vue'
import { ref, watch } from 'vue'
import { renderBadgeHtml } from '@/composables/print/badgeHtml'
import { printBadgePages } from '@/composables/print/printFrame'
import { localBadgeMappingStore } from '@/composables/services/badgeMappingStore'
import { localBadgeTypeStore } from '@/composables/services/badgeTypeStore'
import { localPrintRowStore } from '@/composables/services/printRowStore'
import { localPrintSettingsStore } from '@/composables/services/printSettingsStore'
import { NO_FLAG, mappingKey } from '@/types/badgeMapping'
import { createEmptyPrintRow } from '@/types/printRow'
import { buildPageSizeCss, getOrientedPageDimensionsMm } from '@/types/printSettings'
import type { BadgeMapping } from '@/types/badgeMapping'
import type { PrintRow } from '@/types/printRow'
import type { BadgeType } from '@/types/badgeType'

const badgeTypes = ref<BadgeType[]>(localBadgeTypeStore.load())
const badgeMapping = ref<BadgeMapping>(localBadgeMappingStore.load())
const printRows = ref<PrintRow[]>(localPrintRowStore.load())
const pasteTargetBadgeTypeId = ref<string | null>(badgeTypes.value[0]?.id ?? null)

watch(printRows, (value) => {
  localPrintRowStore.save(value)
}, { deep: true })

function badgeTypeFor(row: PrintRow): BadgeType | undefined {
  return badgeTypes.value.find((badgeType) => badgeType.id === row.badgeTypeId)
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

async function pasteRows() {
  if (!pasteTargetBadgeTypeId.value) {
    return
  }
  const text = await navigator.clipboard.readText()
  const badgeTypeId = pasteTargetBadgeTypeId.value
  const rows = text
    .split('\n')
    .map((line) => line.trim())
    .filter((line) => line.length > 0)
    .map((line) => {
      const [idValue = '', nameValue = '', countryValue = ''] = line.split(/\t|,/)
      return {
        ...createEmptyPrintRow(badgeTypeId),
        idValue: idValue.trim(),
        nameValue: nameValue.trim(),
        countryValue: countryValue.trim(),
        flagValue: NO_FLAG,
      }
    })
  printRows.value.push(...rows)
}

function rowsToCsv(): string {
  return printRows.value
    .map((row) => [row.idValue, row.nameValue, row.countryValue].join(','))
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
  const printSettings = localPrintSettingsStore.load()
  const rotate = printSettings.orientation === 'portrait'
  const rowsWithBadgeType = printRows.value
    .map((row) => ({ row, badgeType: badgeTypeFor(row) }))
    .filter((entry): entry is { row: PrintRow; badgeType: BadgeType } => entry.badgeType !== undefined)
  const html = await Promise.all(
    rowsWithBadgeType.map(({ row, badgeType }) =>
      renderBadgeHtml(badgeType, row.idValue, row.nameValue, row.countryValue, rotate, printSettings.dpi),
    ),
  )
  const pages = printSettings.doubleSided ? html.flatMap((pageHtml) => [pageHtml, pageHtml]) : html
  const pageDimensions = getOrientedPageDimensionsMm(printSettings)
  printBadgePages(
    pages,
    buildPageSizeCss(printSettings),
    pageDimensions.width,
    pageDimensions.height,
  )
}
</script>

<template>
  <div class="flex flex-col gap-6 p-8">
    <h1 class="text-lg font-semibold text-slate-800">Mass Print</h1>

    <div class="flex items-center gap-3">
      <Select
        v-model="pasteTargetBadgeTypeId"
        :options="badgeTypes"
        option-label="name"
        option-value="id"
        placeholder="Badge Type for new rows"
        class="w-56"
      />
      <Button label="Add Row" size="small" @click="addRow" />
      <Button label="Paste Rows" size="small" severity="secondary" @click="pasteRows" />
      <Button label="Copy Rows" size="small" severity="secondary" @click="copyRows" />
      <Button label="Download Rows" size="small" severity="secondary" @click="downloadRows" />
      <Button label="Clear Rows" size="small" severity="danger" @click="clearRows" />
      <Button label="Print" @click="printBadges" />
    </div>

    <table class="text-sm text-slate-700">
      <thead>
        <tr class="text-left text-slate-500">
          <th class="pr-4 font-normal">ID</th>
          <th class="pr-4 font-normal">Name</th>
          <th class="pr-4 font-normal">Country</th>
          <th class="pr-4 font-normal">Package</th>
          <th class="pr-4 font-normal">Flag</th>
          <th class="pr-4 font-normal">Badge Type</th>
          <th class="pr-4 font-normal"></th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="row in printRows" :key="row.id">
          <td class="pr-4 py-1">
            <InputText v-model="row.idValue" class="p-1" />
          </td>
          <td class="pr-4">
            <InputText v-model="row.nameValue" class="p-1" />
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
          <td class="pr-4">
            <Button text size="small" severity="danger" aria-label="Delete" icon="pi pi-trash" @click="deleteRow(row.id)" />
          </td>
        </tr>
      </tbody>
    </table>
  </div>
</template>
