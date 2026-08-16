<script setup lang="ts">
import SearchFieldAttendance from '@/components/common/attendee_table/SearchFieldAttendance.vue'
import SearchFieldBirthday from '@/components/common/attendee_table/SearchFieldBirthday.vue'
import SearchFieldCountry from '@/components/common/attendee_table/SearchFieldCountry.vue'
import SearchFieldStandard from '@/components/common/attendee_table/SearchFieldStandard.vue'
import SearchFieldTag from '@/components/common/attendee_table/SearchFieldTag.vue'
import ResetFilterButton from '@/components/regdesk/ResetFilterButton.vue'
import Button from '@/volt/Button.vue'
import DataTable from '@/volt/DataTable.vue'
import Fieldset from '@/volt/Fieldset.vue'
import InputText from '@/volt/InputText.vue'
import Select from '@/volt/Select.vue'
import Toolbar from '@/volt/Toolbar.vue'
import Column from 'primevue/column'
import { computed, ref, useTemplateRef, watch } from 'vue'
import { resolveBadgeType } from '@/composables/badge/badgeTypeInheritance'
import { resolveBadgeMappingForAttendee } from '@/composables/badge/resolveBadgeTypeForAttendee'
import { useAttendeeDataOptions } from '@/composables/filter/useAttendeeDataOptions'
import { BatchCancelledError, downloadBadgesPdf, renderBadgeSvgs, saveBadgesZip } from '@/composables/print/downloadBadgeBatch'
import type { BatchItemFailure, BadgeExportEntry } from '@/composables/print/downloadBadgeBatch'
import { downloadBlob } from '@/composables/print/downloadBadge'
import { PrintCancelledError, printBadgePagesChunked } from '@/composables/print/printFrame'
import RetryFailedDialog from '@/components/badge/RetryFailedDialog.vue'
import { attendeeService } from '@/composables/services/attendeeService'
import { badgeMappingRef, badgeTypesRef, printSettingsRef } from '@/composables/services/badgeConfigStore'
import { localPrintRowStore } from '@/composables/services/printRowStore'
import { getFilteredAttendees } from '@/composables/sort_and_filter/getFilteredAttendees'
import { setupColumnDefinitionList } from '@/config/system/regdesk'
import { NO_FLAG, mappingKey } from '@/types/badgeMapping'
import { ColumnType } from '@/types/internal/component/table'
import type { AllFilterFieldValues } from '@/types/internal/filter'
import type { TransformedAttendeeInfo } from '@/types/internal/attendee'
import { createEmptyPrintRow } from '@/types/printRow'
import { buildPageSizeCss, getOrientedPageDimensionsMm } from '@/types/printSettings'
import type { PrintRow } from '@/types/printRow'
import type { BadgeType, CustomFieldSource, CustomTextFieldState } from '@/types/badgeType'
import type { RestErrorHandler } from '@/composables/api/base/restErrorWrapper'

interface Props {
  errorHandler: RestErrorHandler
}
const props = defineProps<Props>()

const badgeTypes = badgeTypesRef
const badgeMapping = badgeMappingRef
const printRows = ref<PrintRow[]>(localPrintRowStore.load())
const pasteTargetBadgeTypeId = ref<string | null>(badgeTypes.value[0]?.id ?? null)
const printErrorMessage = ref<string | null>(null)
const sortField = ref<string | null>(null)
const sortOrder = ref<1 | -1 | null>(null)

const sortValueGetters: Record<string, (row: PrintRow) => string> = {
  idValue: (row) => row.idValue,
  nicknameValue: (row) => row.nicknameValue,
  countryValue: (row) => row.countryValue,
  packageValue: (row) => row.packageValue,
  flagValue: (row) => row.flagValue,
  badgeTypeId: (row) => badgeTypeNameFor(row),
}

const sortedPrintRows = computed<PrintRow[]>(() => {
  const field = sortField.value
  const order = sortOrder.value
  const getValue = field ? sortValueGetters[field] : undefined
  if (!getValue || !order) {
    return printRows.value
  }
  return [...printRows.value].sort((rowA, rowB) => getValue(rowA).localeCompare(getValue(rowB)) * order)
})

const LARGE_BATCH_WARNING_THRESHOLD = 200

const isPrinting = ref(false)
const exportingSvg = ref(false)
const exportingPdf = ref(false)
const exportStatusMessage = ref<string | null>(null)
const isBatchRunning = computed(() => isPrinting.value || exportingSvg.value || exportingPdf.value)
let activeBatchController: AbortController | null = null

function cancelActiveBatch() {
  activeBatchController?.abort()
}

function confirmLargeBatch(rowCount: number, actionLabel: string): boolean {
  if (rowCount <= LARGE_BATCH_WARNING_THRESHOLD) {
    return true
  }
  return confirm(`${actionLabel} ${rowCount} badges? This may take a while.`)
}

const retryFailedDialog = useTemplateRef('retryFailedDialog')

async function confirmRetryDecision(failures: BatchItemFailure<BadgeExportEntry>[]) {
  const decision = await retryFailedDialog.value!.confirmRetry(failures.map((failure) => failure.item))
  if (decision === 'cancel') {
    throw new BatchCancelledError()
  }
  return decision
}

// Calls runBatch with the entries still failing (initially all of them); if some fail,
// asks the user via RetryFailedDialog whether to retry just those, skip them and keep
// the rest, or cancel entirely. Correct when runBatch's output per entry is independent
// and already final once produced (e.g. one file per entry, like the SVG zip archive —
// each entry's file is written once and doesn't need to be revisited — and the
// print-render step, where each entry's rendered SVG is cached by the caller).
async function retrySubsetBatch(
  entries: BadgeExportEntry[],
  runBatch: (attemptEntries: BadgeExportEntry[]) => Promise<BatchItemFailure<BadgeExportEntry>[]>,
): Promise<void> {
  let attemptEntries = entries
  while (attemptEntries.length > 0) {
    const failures = await runBatch(attemptEntries)
    if (failures.length === 0) {
      return
    }
    const decision = await confirmRetryDecision(failures)
    if (decision === 'skip') {
      return
    }
    attemptEntries = failures.map((failure) => failure.item)
  }
}

// Calls runBatch with the full not-yet-skipped entry list every time (never just the
// failed subset); required when runBatch produces one shared, ordered output for all
// entries together (a single PDF document), where retrying only the failed subset
// would produce a second, separate, incomplete PDF instead of one complete file.
// runBatch's isFinal flag is true only on the last call — once runBatch itself reports
// no failures, or once the user chooses to skip the remaining ones — so the shared
// output is only saved when this attempt's outcome is final, never while still
// awaiting a retry choice.
async function retryFullSetBatch(
  entries: BadgeExportEntry[],
  runBatch: (attemptEntries: BadgeExportEntry[], isFinal: boolean) => Promise<BatchItemFailure<BadgeExportEntry>[]>,
): Promise<void> {
  let attemptEntries = entries
  for (;;) {
    const failures = await runBatch(attemptEntries, false)
    if (failures.length === 0) {
      return
    }
    const decision = await confirmRetryDecision(failures)
    if (decision === 'skip') {
      const failedEntries = new Set(failures.map((failure) => failure.item))
      const remainingEntries = attemptEntries.filter((entry) => !failedEntries.has(entry))
      if (remainingEntries.length > 0) {
        await runBatch(remainingEntries, true)
      }
      return
    }
  }
}

let saveTimer: ReturnType<typeof setTimeout> | null = null
watch(printRows, (value) => {
  if (saveTimer) clearTimeout(saveTimer)
  saveTimer = setTimeout(() => localPrintRowStore.save(value), 500)
}, { deep: true })

const filterColumnDefinitions = setupColumnDefinitionList.filter((column) => column.filterConfig !== undefined)
const dataOptionsRef = useAttendeeDataOptions()
const filling = ref(false)
const fillStatusMessage = ref<string | null>(null)

function attendeeForSingleAttendance(
  attendee: TransformedAttendeeInfo,
  attendanceValue: string,
): TransformedAttendeeInfo {
  const otherAttendanceValues = new Set(
    (attendee.transDayAttendance ?? []).filter((value) => value !== attendanceValue),
  )
  return {
    ...attendee,
    packages_list: (attendee.packages_list ?? []).filter((pkg) => !otherAttendanceValues.has(pkg.name)),
  }
}

function buildPrintRowForAttendeeAttendance(
  attendee: TransformedAttendeeInfo,
  attendanceAttendee: TransformedAttendeeInfo,
): PrintRow {
  const resolvedMapping = resolveBadgeMappingForAttendee(attendanceAttendee, badgeMapping.value)
  const badgeTypeId = resolvedMapping?.badgeTypeId ?? pasteTargetBadgeTypeId.value ?? ''
  return {
    ...createEmptyPrintRow(badgeTypeId),
    idValue: attendee.id === null ? '' : String(attendee.id),
    nicknameValue: attendee.nickname ?? '',
    countryValue: attendee.country ?? '',
    packageValue: resolvedMapping?.packageValue ?? '',
    flagValue: resolvedMapping?.flagValue ?? '',
  }
}

function buildPrintRowsForAttendee(attendee: TransformedAttendeeInfo): PrintRow[] {
  const attendanceValues = attendee.transDayAttendance ?? []
  if (attendanceValues.length <= 1) {
    return [buildPrintRowForAttendeeAttendance(attendee, attendee)]
  }
  return attendanceValues.map((attendanceValue) =>
    buildPrintRowForAttendeeAttendance(attendee, attendeeForSingleAttendance(attendee, attendanceValue)),
  )
}

async function fillFromFilter() {
  filling.value = true
  fillStatusMessage.value = null
  const allAttendees = (await attendeeService.getAllAttendees(props.errorHandler)) ?? []
  const matched = getFilteredAttendees(
    allAttendees,
    dataOptionsRef.value.filterConfig.filterValues,
    dataOptionsRef.value.filterConfig.globalFilterFields,
  )
  const newRows = matched.flatMap(buildPrintRowsForAttendee)
  printRows.value.push(...newRows)
  fillStatusMessage.value = `Added ${newRows.length} row(s) for ${matched.length} attendee(s).`
  filling.value = false
}

function badgeTypeFor(row: PrintRow): BadgeType | undefined {
  return badgeTypes.value.find((badgeType) => badgeType.id === row.badgeTypeId)
}

function badgeTypeNameFor(row: PrintRow): string {
  return badgeTypeFor(row)?.name ?? ''
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

function buildExportEntries(): BadgeExportEntry[] {
  const usedFilenameBases = new Set<string>()
  return sortedPrintRows.value
    .map((row) => ({ row, badgeType: badgeTypeFor(row) }))
    .filter((entry): entry is { row: PrintRow; badgeType: BadgeType } => entry.badgeType !== undefined)
    .map(({ row, badgeType }) => {
      const nameHint = row.idValue || row.nicknameValue || row.id
      let filenameBase = `${badgeType.name}-${nameHint}`
      let suffix = 2
      while (usedFilenameBases.has(filenameBase)) {
        filenameBase = `${badgeType.name}-${nameHint}-${suffix}`
        suffix += 1
      }
      usedFilenameBases.add(filenameBase)
      return {
        resolvedBadgeType: resolveBadgeType(badgeTypes.value, badgeType.id),
        fieldValues: fieldValuesFor(row, badgeType),
        filenameBase,
      }
    })
}

async function printBadges() {
  const entries = buildExportEntries()
  if (entries.length === 0) {
    return
  }
  if (!confirmLargeBatch(entries.length, 'Print')) {
    return
  }
  exportStatusMessage.value = null
  printErrorMessage.value = null
  isPrinting.value = true
  const controller = new AbortController()
  activeBatchController = controller
  try {
    const printSettings = printSettingsRef.value
    const svgsByEntry = new Map<BadgeExportEntry, string>()
    await retrySubsetBatch(entries, async (attemptEntries) => {
      const { svgsByEntry: rendered, failures } = await renderBadgeSvgs(attemptEntries, (renderedCount, totalCount) => {
        exportStatusMessage.value = `Rendering badges: ${renderedCount} / ${totalCount}`
      }, controller.signal)
      rendered.forEach((svg, entry) => svgsByEntry.set(entry, svg))
      return failures
    })
    if (svgsByEntry.size === 0) {
      return
    }
    exportStatusMessage.value = 'Preparing print dialog…'
    const orderedSvgs = entries.map((entry) => svgsByEntry.get(entry)).filter((svg): svg is string => svg !== undefined)
    const pages = printSettings.doubleSided ? orderedSvgs.flatMap((svg) => [svg, svg]) : orderedSvgs
    const pageDimensions = getOrientedPageDimensionsMm(printSettings)
    await printBadgePagesChunked(
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
      controller.signal,
      (chunkIndex, totalChunks) => {
        exportStatusMessage.value = totalChunks > 1 ? `Printing batch ${chunkIndex} / ${totalChunks}…` : null
      },
    )
  } catch (error) {
    if (!(error instanceof BatchCancelledError) && !(error instanceof PrintCancelledError)) {
      printErrorMessage.value = 'Failed to print badges. Please try again.'
    }
  } finally {
    isPrinting.value = false
    exportStatusMessage.value = null
    activeBatchController = null
  }
}

async function exportSvgZip() {
  const entries = buildExportEntries()
  if (entries.length === 0) {
    return
  }
  if (!confirmLargeBatch(entries.length, 'Export')) {
    return
  }
  exportStatusMessage.value = null
  printErrorMessage.value = null
  exportingSvg.value = true
  const controller = new AbortController()
  activeBatchController = controller
  try {
    const svgsByEntry = new Map<BadgeExportEntry, string>()
    await retrySubsetBatch(entries, async (attemptEntries) => {
      const { svgsByEntry: rendered, failures } = await renderBadgeSvgs(attemptEntries, (renderedCount, totalCount) => {
        exportStatusMessage.value = `Rendering SVGs: ${renderedCount} / ${totalCount}`
      }, controller.signal)
      rendered.forEach((svg, entry) => svgsByEntry.set(entry, svg))
      return failures
    })
    if (svgsByEntry.size === 0) {
      return
    }
    const blob = await saveBadgesZip(entries, svgsByEntry)
    downloadBlob(blob, 'badges.zip')
  } catch (error) {
    if (!(error instanceof BatchCancelledError)) {
      printErrorMessage.value = 'Failed to export badge SVGs. Please try again.'
    }
  } finally {
    exportingSvg.value = false
    exportStatusMessage.value = null
    activeBatchController = null
  }
}

async function exportPdf() {
  const entries = buildExportEntries()
  if (entries.length === 0) {
    return
  }
  if (!confirmLargeBatch(entries.length, 'Export')) {
    return
  }
  exportStatusMessage.value = null
  printErrorMessage.value = null
  exportingPdf.value = true
  const controller = new AbortController()
  activeBatchController = controller
  try {
    // downloadBadgesPdf writes every entry into one shared PDF document, so a retry
    // must re-run the full (non-skipped) entry list, not just the failed subset —
    // otherwise a retry would produce a second, separate, incomplete PDF instead of
    // one complete, correctly-ordered file. It only saves once this attempt is final
    // (isFinal, or it reported no failures) so a failed attempt awaiting a retry
    // decision never downloads a partial PDF.
    await retryFullSetBatch(entries, (attemptEntries, isFinal) =>
      downloadBadgesPdf(attemptEntries, 'badges', (renderedCount, totalCount) => {
        exportStatusMessage.value = `Building PDF: ${renderedCount} / ${totalCount}`
      }, controller.signal, isFinal),
    )
  } catch (error) {
    if (!(error instanceof BatchCancelledError)) {
      printErrorMessage.value = 'Failed to export badge PDF. Please try again.'
    }
  } finally {
    exportingPdf.value = false
    exportStatusMessage.value = null
    activeBatchController = null
  }
}
</script>

<template>
  <div class="flex flex-col gap-6 p-8">
    <RetryFailedDialog ref="retryFailedDialog" />
    <Fieldset legend="Fill from Filter" toggleable collapsed>
      <div class="flex flex-col gap-3">
        <div class="flex flex-wrap gap-3">
          <div v-for="columnDefinition in filterColumnDefinitions" :key="columnDefinition.value" class="flex flex-col gap-1">
            <label class="text-sm text-surface-500">{{ columnDefinition.label }}</label>
            <SearchFieldBirthday
              v-if="columnDefinition.columnType === ColumnType.birthday"
              v-model="dataOptionsRef.filterConfig.filterValues[columnDefinition.value as AllFilterFieldValues].value"
            />
            <SearchFieldCountry
              v-else-if="columnDefinition.columnType === ColumnType.country"
              v-model="dataOptionsRef.filterConfig.filterValues[columnDefinition.value as AllFilterFieldValues].value"
            />
            <SearchFieldTag
              v-else-if="columnDefinition.columnType === ColumnType.tag"
              v-model="dataOptionsRef.filterConfig.filterValues[columnDefinition.value as AllFilterFieldValues].value"
              :columnDefinition="columnDefinition"
              :configItems="columnDefinition.configItems"
            />
            <SearchFieldAttendance
              v-else-if="columnDefinition.columnType === ColumnType.attendance"
              v-model="dataOptionsRef.filterConfig.filterValues[columnDefinition.value as AllFilterFieldValues].value"
              :columnDefinition="columnDefinition"
              :configItems="columnDefinition.configItems"
            />
            <SearchFieldStandard
              v-else-if="columnDefinition.columnType === ColumnType.standard"
              v-model="dataOptionsRef.filterConfig.filterValues[columnDefinition.value as AllFilterFieldValues].value"
              v-model:matchMode="dataOptionsRef.filterConfig.filterValues[columnDefinition.value as AllFilterFieldValues].matchMode as string"
              :columnDefinition="columnDefinition"
              :autoCompleteField="null"
              :autoCompleteData="[]"
              placeholder="Search"
            />
          </div>
        </div>
        <div class="flex items-center gap-2">
          <Button label="Fill Table" icon="pi pi-filter" :loading="filling" @click="fillFromFilter" />
          <ResetFilterButton v-model="dataOptionsRef" />
          <span v-if="fillStatusMessage" class="text-sm text-surface-500">{{ fillStatusMessage }}</span>
        </div>
      </div>
    </Fieldset>

    <p v-if="unresolvedRowCount > 0" class="text-sm text-red-600">
      {{ unresolvedRowCount }} row(s) have no Badge Type selected and will be skipped when printing.
    </p>
    <p v-if="printErrorMessage" class="text-sm text-red-600">{{ printErrorMessage }}</p>
    <p v-if="exportStatusMessage" class="text-sm text-surface-500">{{ exportStatusMessage }}</p>

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
        <div class="flex items-center gap-3">
          <Button icon="pi pi-print" label="Print" :disabled="isBatchRunning" :loading="isPrinting" v-tooltip.bottom="'Print'" @click="printBadges" />
          <Button
            icon="pi pi-images"
            label="Export SVGs"
            severity="secondary"
            :disabled="isBatchRunning"
            :loading="exportingSvg"
            v-tooltip.bottom="'Export badges as a .zip of SVG files'"
            @click="exportSvgZip"
          />
          <Button
            icon="pi pi-file-pdf"
            label="Export PDF"
            severity="secondary"
            :disabled="isBatchRunning"
            :loading="exportingPdf"
            v-tooltip.bottom="'Export all badges as a single PDF'"
            @click="exportPdf"
          />
          <Button
            v-if="isBatchRunning"
            icon="pi pi-times"
            label="Cancel"
            severity="danger"
            outlined
            v-tooltip.bottom="'Cancel the running operation'"
            @click="cancelActiveBatch"
          />
        </div>
      </template>
      <template #end>
        <Button icon="pi pi-trash" severity="danger" aria-label="Clear Rows" v-tooltip.bottom="'Clear Rows'" @click="clearRows" />
      </template>
    </Toolbar>

    <DataTable
      :value="sortedPrintRows"
      dataKey="id"
      scrollable
      scrollHeight="600px"
      :virtualScrollerOptions="{ itemSize: 46 }"
      class="text-sm text-slate-700"
      removableSort
      v-model:sortField="sortField"
      v-model:sortOrder="sortOrder"
    >
      <Column header="ID" field="idValue" sortable>
        <template #body="{ data }">
          <InputText v-model="data.idValue" class="p-1" />
        </template>
      </Column>
      <Column header="Nickname" field="nicknameValue" sortable>
        <template #body="{ data }">
          <InputText v-model="data.nicknameValue" class="p-1" />
        </template>
      </Column>
      <Column header="Country" field="countryValue" sortable>
        <template #body="{ data }">
          <InputText v-model="data.countryValue" class="p-1" />
        </template>
      </Column>
      <Column header="Package" field="packageValue" sortable>
        <template #body="{ data }">
          <Select
            :model-value="data.packageValue"
            :options="badgeMapping.packages"
            placeholder="None"
            class="w-40"
            @update:model-value="(value: string | null) => { data.packageValue = value ?? ''; applyMapping(data) }"
          />
        </template>
      </Column>
      <Column header="Flag" field="flagValue" sortable>
        <template #body="{ data }">
          <Select
            :model-value="data.flagValue"
            :options="badgeMapping.flags"
            placeholder="None"
            class="w-40"
            @update:model-value="(value: string | null) => { data.flagValue = value ?? ''; applyMapping(data) }"
          />
        </template>
      </Column>
      <Column header="Badge Type" field="badgeTypeId" sortable>
        <template #body="{ data }">
          <Select
            v-model="data.badgeTypeId"
            :options="badgeTypes"
            option-label="name"
            option-value="id"
            class="w-48"
          />
        </template>
      </Column>
      <Column v-for="field in visibleCustomFields" :key="field.id" :header="field.label">
        <template #body="{ data }">
          <InputText :model-value="data.customValues[field.id] ?? ''" class="p-1" @update:model-value="(value: string) => { data.customValues[field.id] = value }" />
        </template>
      </Column>
      <Column>
        <template #body="{ data }">
          <Button severity="danger" aria-label="Delete" v-tooltip.bottom="'Delete Row'" icon="pi pi-trash" @click="deleteRow(data.id)" />
        </template>
      </Column>
    </DataTable>
  </div>
</template>
