<script setup lang="ts">
import { MIN_FIELD_HEIGHT_PERCENT, MIN_FIELD_WIDTH_PERCENT, clampPosAndSize, clampSquarePosAndSize } from '@/components/badge/badgeFieldUtils'
import { getBarcodeStyleOptions, isBarcodeStyleSquare } from '@/composables/badge/barcodeStyle'
import { getFieldGetters } from '@/composables/sort_and_filter/getFieldGetters'
import { printSettingsRef } from '@/composables/services/badgeConfigStore'
import { createDefaultCustomBarcodeField, createDefaultCustomTextField } from '@/types/badgeType'
import type { BadgeTypeFields, CustomBarcodeFieldState, CustomFieldSource, CustomTextFieldState, FontSizeOverflowMode, TextAlign } from '@/types/badgeType'
import type { TransformedAttendeeInfo } from '@/types/internal/attendee'
import Button from '@/volt/Button.vue'
import Dialog from '@/volt/Dialog.vue'
import InputNumber from '@/volt/InputNumber.vue'
import InputText from '@/volt/InputText.vue'
import Select from '@/volt/Select.vue'
import SelectButton from '@/volt/SelectButton.vue'
import ToggleSwitch from '@/volt/ToggleSwitch.vue'
import { computed, ref } from 'vue'

const props = defineProps<{ hasParent?: boolean; resolvedCustomFields?: CustomTextFieldState[]; resolvedCustomBarcodes?: CustomBarcodeFieldState[]; sampleIdValue?: string }>()

const TEXT_ALIGN_OPTIONS: TextAlign[] = ['left', 'center', 'right']
const OVERFLOW_MODE_OPTIONS: FontSizeOverflowMode[] = ['shrink', 'clip', 'overflow']

function setOverflowMode(field: { overflowMode?: FontSizeOverflowMode }, mode: FontSizeOverflowMode) {
  field.overflowMode = mode
}

const ATTENDEE_FIELD_OPTIONS = Object.keys(getFieldGetters()) as (keyof TransformedAttendeeInfo)[]
const barcodeStyleOptions = computed(() => getBarcodeStyleOptions())

function contentLabel(source: CustomFieldSource): string {
  switch (source.kind) {
    case 'id': return '{id}'
    case 'nickname': return '{nickname}'
    case 'country': return '{country}'
    case 'attendee': return `{${source.attendeeField}}`
    case 'static': return ''
  }
}


type FieldUnit = 'percent' | 'cm'
const UNIT_OPTIONS: FieldUnit[] = ['percent', 'cm']
const UNIT_LABELS: Record<FieldUnit, string> = { percent: '%', cm: 'cm' }
const fieldUnit = ref<FieldUnit>('percent')

const cardWidthCm = computed(() => printSettingsRef.value.cardWidthMm / 10)
const cardHeightCm = computed(() => printSettingsRef.value.cardHeightMm / 10)
const cardAspectRatio = computed(() => cardWidthCm.value / cardHeightCm.value)

function widthToDisplay(v: number) { return fieldUnit.value === 'cm' ? v / 100 * cardWidthCm.value : v }
function heightToDisplay(v: number) { return fieldUnit.value === 'cm' ? v / 100 * cardHeightCm.value : v }
function widthFromDisplay(v: number) { return fieldUnit.value === 'cm' ? v / cardWidthCm.value * 100 : v }
function heightFromDisplay(v: number) { return fieldUnit.value === 'cm' ? v / cardHeightCm.value * 100 : v }

const fields = defineModel<BadgeTypeFields>('fields', { required: true })

const localCustomFieldIds = computed(() => new Set(fields.value.custom.map((field) => field.id)))
const localCustomBarcodeIds = computed(() => new Set(fields.value.customBarcodes.map((field) => field.id)))
const displayedCustomFields = computed<CustomTextFieldState[]>(() => props.resolvedCustomFields ?? fields.value.custom)
const displayedCustomBarcodes = computed<CustomBarcodeFieldState[]>(() => props.resolvedCustomBarcodes ?? fields.value.customBarcodes)

function isCustomFieldInherited(id: string): boolean {
  return !localCustomFieldIds.value.has(id)
}

function isCustomBarcodeInherited(id: string): boolean {
  return !localCustomBarcodeIds.value.has(id)
}

interface CustomFieldRow {
  displayed: CustomTextFieldState
  local: CustomTextFieldState | null
}

interface CustomBarcodeRow {
  displayed: CustomBarcodeFieldState
  local: CustomBarcodeFieldState | null
}

const customFieldRows = computed<CustomFieldRow[]>(() =>
  displayedCustomFields.value.map((displayed) => ({
    displayed,
    local: fields.value.custom.find((field) => field.id === displayed.id) ?? null,
  })),
)

const customBarcodeRows = computed<CustomBarcodeRow[]>(() =>
  displayedCustomBarcodes.value.map((displayed) => ({
    displayed,
    local: fields.value.customBarcodes.find((field) => field.id === displayed.id) ?? null,
  })),
)

function isRowBarcodeSquare(style: string): boolean {
  return isBarcodeStyleSquare(style, props.sampleIdValue ?? '')
}

function addStaticField() {
  fields.value.custom.push(createDefaultCustomTextField())
}

const showAttendeeFieldDialog = ref(false)
const pendingAttendeeField = ref<keyof TransformedAttendeeInfo>('nickname')

function openAttendeeFieldDialog() {
  pendingAttendeeField.value = 'nickname'
  showAttendeeFieldDialog.value = true
}

function confirmAddAttendeeField() {
  const field = createDefaultCustomTextField()
  field.source = { kind: 'attendee', attendeeField: pendingAttendeeField.value }
  fields.value.custom.push(field)
  showAttendeeFieldDialog.value = false
}

const showBarcodeFieldDialog = ref(false)
const pendingBarcodeAttendeeField = ref<keyof TransformedAttendeeInfo>('nickname')

function openBarcodeFieldDialog() {
  pendingBarcodeAttendeeField.value = 'nickname'
  showBarcodeFieldDialog.value = true
}

function confirmAddBarcodeField() {
  const field = createDefaultCustomBarcodeField()
  field.source = { kind: 'attendee', attendeeField: pendingBarcodeAttendeeField.value }
  fields.value.customBarcodes.push(field)
  showBarcodeFieldDialog.value = false
}

function removeCustomField(id: string) {
  fields.value.custom = fields.value.custom.filter((field) => field.id !== id)
}

function removeCustomBarcode(id: string) {
  fields.value.customBarcodes = fields.value.customBarcodes.filter((field) => field.id !== id)
}

function unlinkCustomField(field: CustomTextFieldState) {
  fields.value.custom.push({ ...field })
}

function unlinkCustomBarcode(field: CustomBarcodeFieldState) {
  fields.value.customBarcodes.push({ ...field })
}

const customFontFileInputs = ref<Record<string, HTMLInputElement | null>>({})
const customFontObjectUrls = new Map<string, string>()

function onCustomFontFileChange(event: Event, field: CustomTextFieldState) {
  const file = (event.target as HTMLInputElement).files?.[0]
  if (!file) return
  const previousUrl = customFontObjectUrls.get(field.id)
  if (previousUrl) URL.revokeObjectURL(previousUrl)
  const objectUrl = URL.createObjectURL(file)
  customFontObjectUrls.set(field.id, objectUrl)
  field.fontUrl = objectUrl
}

interface FieldSetup { fields: BadgeTypeFields }

async function copyFieldSetup() {
  const resolvedFields: BadgeTypeFields = { custom: displayedCustomFields.value, customBarcodes: displayedCustomBarcodes.value }
  await navigator.clipboard.writeText(JSON.stringify({ fields: resolvedFields } satisfies FieldSetup))
}

const pasteFieldSetupError = ref<string | null>(null)

function isValidFieldSetup(value: unknown): value is FieldSetup {
  if (typeof value !== 'object' || value === null || !('fields' in value)) return false
  const fields = (value as { fields: unknown }).fields
  if (typeof fields !== 'object' || fields === null) return false
  return Array.isArray((fields as BadgeTypeFields).custom) && Array.isArray((fields as BadgeTypeFields).customBarcodes)
}

async function pasteFieldSetup() {
  pasteFieldSetupError.value = null
  let parsed: unknown
  try {
    parsed = JSON.parse(await navigator.clipboard.readText())
  } catch {
    pasteFieldSetupError.value = 'Clipboard does not contain valid JSON'
    return
  }
  if (!isValidFieldSetup(parsed)) {
    pasteFieldSetupError.value = 'Clipboard does not contain a valid field setup'
    return
  }
  const pasted = parsed.fields

  const pastedFieldById = new Map(pasted.custom.map((field) => [field.id, field]))
  const nextCustom = fields.value.custom.map((field) => pastedFieldById.get(field.id) ?? field)
  const currentlyInheritedFieldIds = new Set(
    (props.resolvedCustomFields ?? []).filter((field) => isCustomFieldInherited(field.id)).map((field) => field.id),
  )
  for (const pastedField of pasted.custom) {
    if (!localCustomFieldIds.value.has(pastedField.id) && !currentlyInheritedFieldIds.has(pastedField.id)) {
      nextCustom.push(pastedField)
    }
  }

  const pastedBarcodeById = new Map(pasted.customBarcodes.map((field) => [field.id, field]))
  const nextCustomBarcodes = fields.value.customBarcodes.map((field) => pastedBarcodeById.get(field.id) ?? field)
  const currentlyInheritedBarcodeIds = new Set(
    (props.resolvedCustomBarcodes ?? []).filter((field) => isCustomBarcodeInherited(field.id)).map((field) => field.id),
  )
  for (const pastedField of pasted.customBarcodes) {
    if (!localCustomBarcodeIds.value.has(pastedField.id) && !currentlyInheritedBarcodeIds.has(pastedField.id)) {
      nextCustomBarcodes.push(pastedField)
    }
  }

  fields.value = { custom: nextCustom, customBarcodes: nextCustomBarcodes }
}

const nicknameField = computed(() => fields.value.custom.find((field) => field.source.kind === 'nickname') ?? null)
</script>

<template>
  <div class="flex flex-col items-start gap-3">
  <table v-if="displayedCustomFields.length > 0 || displayedCustomBarcodes.length > 0" class="text-sm text-slate-700">
    <thead>
      <tr class="text-left text-slate-500">
        <th class="pr-4 font-normal">Label</th>
        <th v-if="hasParent" class="pr-4 font-normal">Inherited</th>
        <th class="pr-4 font-normal">Enabled</th>
        <th class="pr-4 font-normal">Content</th>
        <th class="pr-4 font-normal">X {{ UNIT_LABELS[fieldUnit] }}</th>
        <th class="pr-4 font-normal">Y {{ UNIT_LABELS[fieldUnit] }}</th>
        <th class="pr-4 font-normal">Width {{ UNIT_LABELS[fieldUnit] }}</th>
        <th class="pr-4 font-normal">Height {{ UNIT_LABELS[fieldUnit] }}</th>
        <th class="pr-4 font-normal">Color</th>
        <th class="pr-4 font-normal">Align</th>
        <th class="pr-4 font-normal">Font</th>
        <th class="pr-4 font-normal">Font Size</th>
        <th class="pr-4 font-normal"></th>
      </tr>
    </thead>
    <tbody>
      <tr v-for="row in customFieldRows" :key="row.displayed.id">
        <template v-if="row.local">
          <td class="pr-4 py-1"><InputText v-model="row.local.label" class="w-24 p-1 text-xs" /></td>
          <td v-if="hasParent" class="pr-4"><ToggleSwitch :model-value="false" @update:model-value="removeCustomField(row.local!.id)" /></td>
          <td class="pr-4"><ToggleSwitch v-model="row.local.enabled" /></td>
          <td class="pr-4">
            <InputText v-if="row.local.source.kind === 'static'" v-model="row.local.source.text" class="w-32 p-1 text-xs" />
            <span v-else>{{ contentLabel(row.local.source) }}</span>
          </td>
          <td class="pr-4"><InputNumber :model-value="widthToDisplay(row.local.pos.x)" :min="0" :max="widthToDisplay(100)" :max-fraction-digits="2" :suffix="UNIT_LABELS[fieldUnit]" input-class="w-20" @update:model-value="(v: number | null) => { row.local!.pos = clampPosAndSize({ ...row.local!.pos, x: widthFromDisplay(v ?? 0) }, row.local!.size).pos }" /></td>
          <td class="pr-4"><InputNumber :model-value="heightToDisplay(row.local.pos.y)" :min="0" :max="heightToDisplay(100)" :max-fraction-digits="2" :suffix="UNIT_LABELS[fieldUnit]" input-class="w-20" @update:model-value="(v: number | null) => { row.local!.pos = clampPosAndSize({ ...row.local!.pos, y: heightFromDisplay(v ?? 0) }, row.local!.size).pos }" /></td>
          <td class="pr-4"><InputNumber :model-value="widthToDisplay(row.local.size.width)" :min="widthToDisplay(MIN_FIELD_WIDTH_PERCENT)" :max="widthToDisplay(100)" :max-fraction-digits="2" :suffix="UNIT_LABELS[fieldUnit]" input-class="w-20" @update:model-value="(v: number | null) => { const c = clampPosAndSize(row.local!.pos, { ...row.local!.size, width: widthFromDisplay(v ?? MIN_FIELD_WIDTH_PERCENT) }); row.local!.pos = c.pos; row.local!.size = c.size }" /></td>
          <td class="pr-4"><InputNumber :model-value="heightToDisplay(row.local.size.height)" :min="heightToDisplay(MIN_FIELD_HEIGHT_PERCENT)" :max="heightToDisplay(100)" :max-fraction-digits="2" :suffix="UNIT_LABELS[fieldUnit]" input-class="w-20" @update:model-value="(v: number | null) => { const c = clampPosAndSize(row.local!.pos, { ...row.local!.size, height: heightFromDisplay(v ?? MIN_FIELD_HEIGHT_PERCENT) }); row.local!.pos = c.pos; row.local!.size = c.size }" /></td>
          <td class="pr-4">
            <div class="flex items-center gap-2">
              <input type="color" :value="`#${row.local.color}`" class="h-8 w-8 cursor-pointer rounded border border-slate-300" @input="row.local!.color = ($event.target as HTMLInputElement).value.slice(1)" />
              <ToggleSwitch :model-value="row.local.borderEnabled ?? false" @update:model-value="(v: boolean) => { row.local!.borderEnabled = v }" />
              <input type="color" :value="`#${row.local.borderColor ?? '000000'}`" class="h-8 w-8 rounded border border-slate-300" :class="row.local.borderEnabled ? 'cursor-pointer' : 'opacity-40 cursor-not-allowed'" :disabled="!row.local.borderEnabled" @input="row.local!.borderColor = ($event.target as HTMLInputElement).value.slice(1)" />
            </div>
          </td>
          <td class="pr-4">
            <SelectButton v-model="row.local.align" :options="TEXT_ALIGN_OPTIONS" :allow-empty="false">
              <template #option="{ option }"><i :class="`pi pi-align-${option}`" /></template>
            </SelectButton>
          </td>
          <td class="pr-4">
            <div class="flex items-center gap-2">
              <InputText v-model="row.local.fontUrl" class="w-32 p-1 text-xs" placeholder="Font URL (.otf)" />
              <Button label="Browse..." size="small" @click="customFontFileInputs[row.local.id]?.click()" />
              <input :ref="(el) => { customFontFileInputs[row.local!.id] = el as HTMLInputElement }" type="file" accept=".otf" class="hidden" @change="onCustomFontFileChange($event, row.local!)" />
            </div>
          </td>
          <td class="pr-4">
            <div class="flex items-center gap-2">
              <InputNumber v-model="row.local.fontSizePt" :min="1" suffix="pt" input-class="w-16" placeholder="auto" />
              <Select
                v-if="row.local.fontSizePt != null"
                :model-value="row.local.overflowMode ?? 'shrink'"
                :options="OVERFLOW_MODE_OPTIONS"
                class="w-28"
                @update:model-value="(v: FontSizeOverflowMode) => setOverflowMode(row.local!, v)"
              />
            </div>
          </td>
          <td class="pr-4">
            <Button text size="small" severity="danger" aria-label="Delete" icon="pi pi-trash" @click="removeCustomField(row.local.id)" />
          </td>
        </template>
        <template v-else>
          <td class="pr-4 py-1 text-slate-500">{{ row.displayed.label }}</td>
          <td v-if="hasParent" class="pr-4"><ToggleSwitch :model-value="true" @update:model-value="unlinkCustomField(row.displayed)" /></td>
          <td class="pr-4"><ToggleSwitch :model-value="row.displayed.enabled" disabled /></td>
          <td class="pr-4 text-slate-500">
            {{ row.displayed.source.kind === 'static' ? row.displayed.source.text : contentLabel(row.displayed.source) }}
          </td>
          <td class="pr-4" colspan="7"></td>
          <td class="pr-4"></td>
        </template>
      </tr>
      <tr v-for="row in customBarcodeRows" :key="row.displayed.id">
        <template v-if="row.local">
          <td class="pr-4 py-1"><InputText v-model="row.local.label" class="w-24 p-1 text-xs" /></td>
          <td v-if="hasParent" class="pr-4"><ToggleSwitch :model-value="false" @update:model-value="removeCustomBarcode(row.local!.id)" /></td>
          <td class="pr-4"><ToggleSwitch v-model="row.local.enabled" /></td>
          <td class="pr-4">{{ contentLabel(row.local.source) }}</td>
          <td class="pr-4"><InputNumber :model-value="widthToDisplay(row.local.pos.x)" :min="0" :max="widthToDisplay(100)" :max-fraction-digits="2" :suffix="UNIT_LABELS[fieldUnit]" input-class="w-20" @update:model-value="(v: number | null) => { row.local!.pos = clampPosAndSize({ ...row.local!.pos, x: widthFromDisplay(v ?? 0) }, row.local!.size).pos }" /></td>
          <td class="pr-4"><InputNumber :model-value="heightToDisplay(row.local.pos.y)" :min="0" :max="heightToDisplay(100)" :max-fraction-digits="2" :suffix="UNIT_LABELS[fieldUnit]" input-class="w-20" @update:model-value="(v: number | null) => { row.local!.pos = clampPosAndSize({ ...row.local!.pos, y: heightFromDisplay(v ?? 0) }, row.local!.size).pos }" /></td>
          <td class="pr-4"><InputNumber :model-value="widthToDisplay(row.local.size.width)" :min="widthToDisplay(MIN_FIELD_WIDTH_PERCENT)" :max="widthToDisplay(100)" :max-fraction-digits="2" :suffix="UNIT_LABELS[fieldUnit]" input-class="w-20" @update:model-value="(v: number | null) => { const c = isRowBarcodeSquare(row.local!.style) ? clampSquarePosAndSize(row.local!.pos, widthFromDisplay(v ?? MIN_FIELD_WIDTH_PERCENT), cardAspectRatio) : clampPosAndSize(row.local!.pos, { ...row.local!.size, width: widthFromDisplay(v ?? MIN_FIELD_WIDTH_PERCENT) }); row.local!.pos = c.pos; row.local!.size = c.size }" /></td>
          <td class="pr-4"><InputNumber :model-value="heightToDisplay(row.local.size.height)" :min="heightToDisplay(MIN_FIELD_HEIGHT_PERCENT)" :max="heightToDisplay(100)" :max-fraction-digits="2" :suffix="UNIT_LABELS[fieldUnit]" input-class="w-20" :disabled="isRowBarcodeSquare(row.local.style)" @update:model-value="(v: number | null) => { const c = clampPosAndSize(row.local!.pos, { ...row.local!.size, height: heightFromDisplay(v ?? MIN_FIELD_HEIGHT_PERCENT) }); row.local!.pos = c.pos; row.local!.size = c.size }" /></td>
          <td class="pr-4">
            <label class="flex items-center gap-2"><ToggleSwitch v-model="row.local.inverted" /> Invert</label>
          </td>
          <td class="pr-4">
            <div class="flex items-center gap-2">
              <input type="color" :value="`#${row.local.color ?? '000000'}`" class="h-8 w-8 cursor-pointer rounded border border-slate-300" :disabled="row.local.inverted" :class="row.local.inverted ? 'opacity-40 cursor-not-allowed' : ''" @input="row.local!.color = ($event.target as HTMLInputElement).value.slice(1)" />
              <label class="flex items-center gap-2"><ToggleSwitch v-model="row.local.transparentBackground" /> Transparent</label>
            </div>
          </td>
          <td class="pr-4" colspan="2">
            <Select v-model="row.local.style" :options="barcodeStyleOptions" option-label="label" option-value="value" filter class="w-40" />
          </td>
          <td class="pr-4">
            <Button text size="small" severity="danger" aria-label="Delete" icon="pi pi-trash" @click="removeCustomBarcode(row.local.id)" />
          </td>
        </template>
        <template v-else>
          <td class="pr-4 py-1 text-slate-500">{{ row.displayed.label }}</td>
          <td v-if="hasParent" class="pr-4"><ToggleSwitch :model-value="true" @update:model-value="unlinkCustomBarcode(row.displayed)" /></td>
          <td class="pr-4"><ToggleSwitch :model-value="row.displayed.enabled" disabled /></td>
          <td class="pr-4 text-slate-500">{{ contentLabel(row.displayed.source) }}</td>
          <td class="pr-4" colspan="4"></td>
          <td class="pr-4 text-slate-500">{{ row.displayed.inverted ? 'Inverted' : '' }}</td>
          <td class="pr-4 text-slate-500">
            <div class="flex items-center gap-2">
              <span v-if="!row.displayed.inverted" class="inline-block h-4 w-4 rounded border border-slate-300" :style="{ backgroundColor: `#${row.displayed.color ?? '000000'}` }"></span>
              <span v-if="row.displayed.transparentBackground">Transparent</span>
            </div>
          </td>
          <td class="pr-4 text-slate-500" colspan="2">{{ row.displayed.style }}</td>
          <td class="pr-4"></td>
        </template>
      </tr>
    </tbody>
  </table>

  <div class="flex gap-2">
    <Button label="Add Static Field" size="small" severity="secondary" @click="addStaticField" />
    <Button label="Add Attendee Field" size="small" severity="secondary" @click="openAttendeeFieldDialog" />
    <Button label="Add Barcode Field" size="small" severity="secondary" @click="openBarcodeFieldDialog" />
  </div>

  <Dialog v-model:visible="showAttendeeFieldDialog" modal header="Add Attendee Field" class="w-fit">
    <div class="flex flex-col gap-4 items-center">
      <Select v-model="pendingAttendeeField" :options="ATTENDEE_FIELD_OPTIONS" class="w-56" />
      <Button label="Add Field" @click="confirmAddAttendeeField" />
    </div>
  </Dialog>

  <Dialog v-model:visible="showBarcodeFieldDialog" modal header="Add Barcode Field" class="w-fit">
    <div class="flex flex-col gap-4 items-center">
      <Select v-model="pendingBarcodeAttendeeField" :options="ATTENDEE_FIELD_OPTIONS" class="w-56" />
      <Button label="Add Field" @click="confirmAddBarcodeField" />
    </div>
  </Dialog>

  <div v-if="nicknameField" class="flex items-center gap-3 self-start text-sm text-slate-600">
    <span>Nickname wrap</span>
    <span>Wrap &gt;</span>
    <InputNumber :model-value="nicknameField.wrapAt ?? null" :min="1" :max="200" input-class="w-16" placeholder="off" @update:model-value="(v: number | null) => { nicknameField!.wrapAt = v ?? undefined }" />
    <span>Line height</span>
    <InputNumber :model-value="nicknameField.wrapLineHeight != null ? heightToDisplay(nicknameField.wrapLineHeight) : null" :min="0" :max-fraction-digits="2" :suffix="UNIT_LABELS[fieldUnit]" input-class="w-16" placeholder="auto" @update:model-value="(v: number | null) => { nicknameField!.wrapLineHeight = v != null ? heightFromDisplay(v) : undefined }" />
    <span>Trunc &gt;</span>
    <InputNumber :model-value="nicknameField.truncateAt ?? null" :min="1" :max="200" input-class="w-16" placeholder="off" @update:model-value="(v: number | null) => { nicknameField!.truncateAt = v ?? undefined }" />
  </div>

  <div class="flex items-center gap-3">
    <span class="text-sm text-slate-600">Units</span>
    <SelectButton v-model="fieldUnit" :options="UNIT_OPTIONS" :option-label="(option: string) => UNIT_LABELS[option as FieldUnit]" :allow-empty="false" />
    <Button label="Copy Field Setup" severity="secondary" @click="copyFieldSetup" />
    <Button label="Paste Field Setup" severity="secondary" @click="pasteFieldSetup" />
    <span v-if="pasteFieldSetupError" class="text-sm text-red-600">{{ pasteFieldSetupError }}</span>
  </div>
  </div>
</template>
