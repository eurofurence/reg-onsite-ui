<script setup lang="ts">
import { CARD_HEIGHT_CM, CARD_WIDTH_CM, MIN_FIELD_HEIGHT_PERCENT, MIN_FIELD_WIDTH_PERCENT, clampPosAndSize, clampSquarePosAndSize } from '@/components/badge/badgeFieldUtils'
import type { BadgeTypeFields, FieldKey, FieldPosition, TextAlign } from '@/types/badgeType'
import Button from '@/volt/Button.vue'
import InputNumber from '@/volt/InputNumber.vue'
import InputText from '@/volt/InputText.vue'
import SelectButton from '@/volt/SelectButton.vue'
import ToggleSwitch from '@/volt/ToggleSwitch.vue'
import { ref } from 'vue'

const emit = defineEmits<{ applyToAll: [fields: BadgeTypeFields] }>()

const TEXT_ALIGN_OPTIONS: TextAlign[] = ['left', 'center', 'right']

const FIELD_LABELS: Record<FieldKey, string> = { id: 'ID', name: 'Name', country: 'Country', datamatrix: 'Data Matrix' }

type FieldUnit = 'percent' | 'cm'
const UNIT_OPTIONS: FieldUnit[] = ['percent', 'cm']
const UNIT_LABELS: Record<FieldUnit, string> = { percent: '%', cm: 'cm' }
const fieldUnit = ref<FieldUnit>('percent')

function widthToDisplay(v: number) { return fieldUnit.value === 'cm' ? v / 100 * CARD_WIDTH_CM : v }
function heightToDisplay(v: number) { return fieldUnit.value === 'cm' ? v / 100 * CARD_HEIGHT_CM : v }
function widthFromDisplay(v: number) { return fieldUnit.value === 'cm' ? v / CARD_WIDTH_CM * 100 : v }
function heightFromDisplay(v: number) { return fieldUnit.value === 'cm' ? v / CARD_HEIGHT_CM * 100 : v }

const fields = defineModel<BadgeTypeFields>('fields', { required: true })

const idFontFileInput = ref<HTMLInputElement | null>(null)
const nameFontFileInput = ref<HTMLInputElement | null>(null)
const countryFontFileInput = ref<HTMLInputElement | null>(null)
let idFontObjectUrl: string | null = null
let nameFontObjectUrl: string | null = null
let countryFontObjectUrl: string | null = null

function applyPosAndSize(field: FieldKey, pos: FieldPosition, size: { width: number; height: number }) {
  if (field === 'datamatrix') {
    fields.value.datamatrix = { ...fields.value.datamatrix, ...clampSquarePosAndSize(pos, size.width) }
    return
  }
  fields.value[field] = { ...fields.value[field], ...clampPosAndSize(pos, size) }
}

function updateFieldPos(field: FieldKey, axis: 'x' | 'y', value: number) {
  const current = fields.value[field]
  applyPosAndSize(field, { ...current.pos, [axis]: value }, current.size)
}

function updateFieldSize(field: FieldKey, dimension: 'width' | 'height', value: number) {
  const current = fields.value[field]
  applyPosAndSize(field, current.pos, { ...current.size, [dimension]: value })
}

function toggleFieldEnabled(field: FieldKey, enabled: boolean) {
  if (field === 'datamatrix') { fields.value.datamatrix = { ...fields.value.datamatrix, enabled }; return }
  fields.value[field] = { ...fields.value[field], enabled }
}

function onFontFileChange(event: Event, key: 'id' | 'name' | 'country') {
  const file = (event.target as HTMLInputElement).files?.[0]
  if (!file) return
  if (key === 'id') { if (idFontObjectUrl) URL.revokeObjectURL(idFontObjectUrl); idFontObjectUrl = URL.createObjectURL(file); fields.value.id = { ...fields.value.id, fontUrl: idFontObjectUrl } }
  else if (key === 'name') { if (nameFontObjectUrl) URL.revokeObjectURL(nameFontObjectUrl); nameFontObjectUrl = URL.createObjectURL(file); fields.value.name = { ...fields.value.name, fontUrl: nameFontObjectUrl } }
  else { if (countryFontObjectUrl) URL.revokeObjectURL(countryFontObjectUrl); countryFontObjectUrl = URL.createObjectURL(file); fields.value.country = { ...fields.value.country, fontUrl: countryFontObjectUrl } }
}

interface FieldSetup { fields: BadgeTypeFields }
async function copyFieldSetup() { await navigator.clipboard.writeText(JSON.stringify({ fields: fields.value } satisfies FieldSetup)) }
async function pasteFieldSetup() { fields.value = (JSON.parse(await navigator.clipboard.readText()) as FieldSetup).fields }
function applyFieldsToAllBadgeTypes() { emit('applyToAll', fields.value) }
</script>

<template>
  <div class="flex flex-col items-center gap-3">
  <table class="text-sm text-slate-700">
    <thead>
      <tr class="text-left text-slate-500">
        <th class="pr-4 font-normal">Field</th>
        <th class="pr-4 font-normal">Enabled</th>
        <th class="pr-4 font-normal">X {{ UNIT_LABELS[fieldUnit] }}</th>
        <th class="pr-4 font-normal">Y {{ UNIT_LABELS[fieldUnit] }}</th>
        <th class="pr-4 font-normal">Width {{ UNIT_LABELS[fieldUnit] }}</th>
        <th class="pr-4 font-normal">Height {{ UNIT_LABELS[fieldUnit] }}</th>
        <th class="pr-4 font-normal">Color</th>
        <th class="pr-4 font-normal">Align</th>
        <th class="pr-4 font-normal">Font</th>
      </tr>
    </thead>
    <tbody>
      <tr v-for="key in (['id', 'name', 'country', 'datamatrix'] as const)" :key="key">
        <td class="pr-4 py-1">{{ FIELD_LABELS[key] }}</td>
        <td class="pr-4"><ToggleSwitch :model-value="fields[key].enabled" @update:model-value="(v: boolean) => toggleFieldEnabled(key, v)" /></td>
        <td class="pr-4"><InputNumber :model-value="widthToDisplay(fields[key].pos.x)" :min="0" :max="widthToDisplay(100)" :max-fraction-digits="2" :suffix="UNIT_LABELS[fieldUnit]" input-class="w-20" @update:model-value="(v: number | null) => updateFieldPos(key, 'x', widthFromDisplay(v ?? 0))" /></td>
        <td class="pr-4"><InputNumber :model-value="heightToDisplay(fields[key].pos.y)" :min="0" :max="heightToDisplay(100)" :max-fraction-digits="2" :suffix="UNIT_LABELS[fieldUnit]" input-class="w-20" @update:model-value="(v: number | null) => updateFieldPos(key, 'y', heightFromDisplay(v ?? 0))" /></td>
        <td class="pr-4"><InputNumber :model-value="widthToDisplay(fields[key].size.width)" :min="widthToDisplay(MIN_FIELD_WIDTH_PERCENT)" :max="widthToDisplay(100)" :max-fraction-digits="2" :suffix="UNIT_LABELS[fieldUnit]" input-class="w-20" @update:model-value="(v: number | null) => updateFieldSize(key, 'width', widthFromDisplay(v ?? MIN_FIELD_WIDTH_PERCENT))" /></td>
        <td class="pr-4"><InputNumber :model-value="heightToDisplay(fields[key].size.height)" :min="heightToDisplay(MIN_FIELD_HEIGHT_PERCENT)" :max="heightToDisplay(100)" :max-fraction-digits="2" :suffix="UNIT_LABELS[fieldUnit]" input-class="w-20" :disabled="key === 'datamatrix'" @update:model-value="(v: number | null) => updateFieldSize(key, 'height', heightFromDisplay(v ?? MIN_FIELD_HEIGHT_PERCENT))" /></td>
        <!-- Color -->
        <td class="pr-4">
          <div v-if="key === 'id'" class="flex items-center gap-2">
            <input type="color" :value="`#${fields.id.color}`" class="h-8 w-8 cursor-pointer rounded border border-slate-300" @input="fields.id.color = ($event.target as HTMLInputElement).value.slice(1)" />
            <ToggleSwitch :model-value="fields.id.borderEnabled ?? false" @update:model-value="(v: boolean) => { fields.id.borderEnabled = v }" />
            <input type="color" :value="`#${fields.id.borderColor ?? '000000'}`" class="h-8 w-8 rounded border border-slate-300" :class="fields.id.borderEnabled ? 'cursor-pointer' : 'opacity-40 cursor-not-allowed'" :disabled="!fields.id.borderEnabled" @input="fields.id.borderColor = ($event.target as HTMLInputElement).value.slice(1)" />
          </div>
          <div v-else-if="key === 'name'" class="flex items-center gap-2">
            <input type="color" :value="`#${fields.name.color}`" class="h-8 w-8 cursor-pointer rounded border border-slate-300" @input="fields.name.color = ($event.target as HTMLInputElement).value.slice(1)" />
            <ToggleSwitch :model-value="fields.name.borderEnabled ?? false" @update:model-value="(v: boolean) => { fields.name.borderEnabled = v }" />
            <input type="color" :value="`#${fields.name.borderColor ?? '000000'}`" class="h-8 w-8 rounded border border-slate-300" :class="fields.name.borderEnabled ? 'cursor-pointer' : 'opacity-40 cursor-not-allowed'" :disabled="!fields.name.borderEnabled" @input="fields.name.borderColor = ($event.target as HTMLInputElement).value.slice(1)" />
          </div>
          <div v-else-if="key === 'country'" class="flex items-center gap-2">
            <input type="color" :value="`#${fields.country.color}`" class="h-8 w-8 cursor-pointer rounded border border-slate-300" @input="fields.country.color = ($event.target as HTMLInputElement).value.slice(1)" />
            <ToggleSwitch :model-value="fields.country.borderEnabled ?? false" @update:model-value="(v: boolean) => { fields.country.borderEnabled = v }" />
            <input type="color" :value="`#${fields.country.borderColor ?? '000000'}`" class="h-8 w-8 rounded border border-slate-300" :class="fields.country.borderEnabled ? 'cursor-pointer' : 'opacity-40 cursor-not-allowed'" :disabled="!fields.country.borderEnabled" @input="fields.country.borderColor = ($event.target as HTMLInputElement).value.slice(1)" />
          </div>
          <label v-else class="flex items-center gap-2"><ToggleSwitch v-model="fields.datamatrix.inverted" /> Invert</label>
        </td>
        <!-- Align -->
        <td class="pr-4">
          <SelectButton v-if="key !== 'datamatrix'" v-model="fields[key as 'id'|'name'|'country'].align" :options="TEXT_ALIGN_OPTIONS" :allow-empty="false">
            <template #option="{ option }"><i :class="`pi pi-align-${option}`" /></template>
          </SelectButton>
        </td>
        <!-- Font -->
        <td class="pr-4">
          <div v-if="key === 'id'" class="flex items-center gap-2">
            <InputText v-model="fields.id.fontUrl" class="w-32 p-1 text-xs" placeholder="Font URL (.otf)" />
            <Button label="Browse..." size="small" @click="idFontFileInput?.click()" />
            <input :ref="(el) => { idFontFileInput = el as HTMLInputElement }" type="file" accept=".otf" class="hidden" @change="onFontFileChange($event, 'id')" />
          </div>
          <div v-else-if="key === 'name'" class="flex items-center gap-2">
            <InputText v-model="fields.name.fontUrl" class="w-32 p-1 text-xs" placeholder="Font URL (.otf)" />
            <Button label="Browse..." size="small" @click="nameFontFileInput?.click()" />
            <input :ref="(el) => { nameFontFileInput = el as HTMLInputElement }" type="file" accept=".otf" class="hidden" @change="onFontFileChange($event, 'name')" />
          </div>
          <div v-else-if="key === 'country'" class="flex items-center gap-2">
            <InputText v-model="fields.country.fontUrl" class="w-32 p-1 text-xs" placeholder="Font URL (.otf)" />
            <Button label="Browse..." size="small" @click="countryFontFileInput?.click()" />
            <input :ref="(el) => { countryFontFileInput = el as HTMLInputElement }" type="file" accept=".otf" class="hidden" @change="onFontFileChange($event, 'country')" />
          </div>
        </td>
      </tr>
    </tbody>
  </table>

  <div class="flex items-center gap-3 self-start text-sm text-slate-600">
    <span>Name wrap</span>
    <span>Wrap &gt;</span>
    <InputNumber :model-value="fields.name.wrapAt ?? null" :min="1" :max="200" input-class="w-16" placeholder="off" @update:model-value="(v: number | null) => { fields.name.wrapAt = v ?? undefined }" />
    <span>Line height</span>
    <InputNumber :model-value="fields.name.wrapLineHeight != null ? heightToDisplay(fields.name.wrapLineHeight) : null" :min="0" :max-fraction-digits="2" :suffix="UNIT_LABELS[fieldUnit]" input-class="w-16" placeholder="auto" @update:model-value="(v: number | null) => { fields.name.wrapLineHeight = v != null ? heightFromDisplay(v) : undefined }" />
    <span>Trunc &gt;</span>
    <InputNumber :model-value="fields.name.truncateAt ?? null" :min="1" :max="200" input-class="w-16" placeholder="off" @update:model-value="(v: number | null) => { fields.name.truncateAt = v ?? undefined }" />
  </div>

  <div class="flex items-center gap-3">
    <span class="text-sm text-slate-600">Units</span>
    <SelectButton v-model="fieldUnit" :options="UNIT_OPTIONS" :option-label="(option: string) => UNIT_LABELS[option as FieldUnit]" :allow-empty="false" />
    <Button label="Copy Field Setup" severity="secondary" @click="copyFieldSetup" />
    <Button label="Paste Field Setup" severity="secondary" @click="pasteFieldSetup" />
    <Button label="Apply to all badge types" severity="secondary" @click="applyFieldsToAllBadgeTypes" />
  </div>
  </div>
</template>
