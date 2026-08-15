<script setup lang="ts">
import BadgeBackgroundSetup from '@/components/badge/BadgeBackgroundSetup.vue'
import BadgeFieldTable from '@/components/badge/BadgeFieldTable.vue'
import BadgePreviewCanvas from '@/components/badge/BadgePreviewCanvas.vue'
import { resolveBadgeType } from '@/composables/badge/badgeTypeInheritance'
import { renderBadgeSvg } from '@/composables/print/badgeHtml'
import { downloadBadgePdf, downloadBadgeSvg } from '@/composables/print/downloadBadge'
import { printBadgePages } from '@/composables/print/printFrame'
import { printSettingsRef } from '@/composables/services/badgeConfigStore'
import { createDefaultBadgeTypeBackground } from '@/types/badgeType'
import type { BadgeType, BadgeTypeBackground, BadgeTypeFields, CustomFieldSource } from '@/types/badgeType'
import { buildPageSizeCss, getOrientedPageDimensionsMm } from '@/types/printSettings'
import Button from '@/volt/Button.vue'
import Fieldset from '@/volt/Fieldset.vue'
import InputText from '@/volt/InputText.vue'
import Select from '@/volt/Select.vue'
import ToggleSwitch from '@/volt/ToggleSwitch.vue'
import { computed, ref, watch, watchEffect } from 'vue'

const props = defineProps<{ badgeTypes: BadgeType[]; availableParentOptions: BadgeType[] }>()
const emit = defineEmits<{ 'field-drag-start': []; 'field-drag-end': [] }>()

const NAME_MAX_LENGTH = 100

const badgeType = defineModel<BadgeType>({ required: true })
const idValue = defineModel<string>('idValue', { default: '123456' })
const nicknameValue = defineModel<string>('nicknameValue', { default: 'John Doe' })
const countryValue = defineModel<string>('countryValue', { default: 'USA' })
const customValues = defineModel<Record<string, string>>('customValues', { default: () => ({}) })

const resolvedBadgeType = computed(() => resolveBadgeType(props.badgeTypes, badgeType.value.id))

function resolveSourceValue(source: CustomFieldSource, fieldId: string): string {
  switch (source.kind) {
    case 'id': return idValue.value
    case 'nickname': return nicknameValue.value
    case 'country': return countryValue.value
    case 'static': return source.text
    case 'attendee': return customValues.value[fieldId] ?? ''
  }
}

const previewFieldValues = computed<Record<string, string>>(() => {
  const values: Record<string, string> = {}
  for (const field of resolvedBadgeType.value.fields.custom) {
    values[field.id] = resolveSourceValue(field.source, field.id)
  }
  for (const field of resolvedBadgeType.value.fields.customBarcodes) {
    values[field.id] = resolveSourceValue(field.source, field.id)
  }
  return values
})
const attendeeSourcedCustomFields = computed(() =>
  resolvedBadgeType.value.fields.custom.filter((field) => field.source.kind === 'attendee'),
)
const hasIdField = computed(() => resolvedBadgeType.value.fields.custom.some((field) => field.source.kind === 'id'))
const hasNicknameField = computed(() => resolvedBadgeType.value.fields.custom.some((field) => field.source.kind === 'nickname'))
const hasCountryField = computed(() => resolvedBadgeType.value.fields.custom.some((field) => field.source.kind === 'country'))
const resolvedCustomFields = computed(() => resolvedBadgeType.value.fields.custom)
const resolvedCustomBarcodes = computed(() => resolvedBadgeType.value.fields.customBarcodes)

const background = ref<BadgeTypeBackground>(createDefaultBadgeTypeBackground())

function emptyFields(): BadgeTypeFields {
  return { custom: [], customBarcodes: [] }
}

const fields = ref<BadgeTypeFields>(emptyFields())
const badgeTypeId = ref(badgeType.value.id)
const badgeTypeName = ref(badgeType.value.name)
const parentId = ref(badgeType.value.parentId)
const inherit = ref(badgeType.value.inherit)

watch(() => badgeType.value.name, (name) => { badgeTypeName.value = name })

watch(() => badgeType.value.id, () => {
  badgeTypeId.value = badgeType.value.id
  badgeTypeName.value = badgeType.value.name
  background.value = badgeType.value.background
  fields.value = badgeType.value.fields
  parentId.value = badgeType.value.parentId
  inherit.value = badgeType.value.inherit
}, { immediate: true })

watch(() => badgeType.value.parentId, (value) => { parentId.value = value })

function setParentId(value: string | null) {
  parentId.value = value
}

watchEffect(() => {
  badgeType.value = {
    id: badgeTypeId.value,
    name: badgeTypeName.value,
    background: background.value,
    fields: fields.value,
    parentId: parentId.value,
    inherit: inherit.value,
  }
})

async function printBadge() {
  const printSettings = printSettingsRef.value
  const svg = await renderBadgeSvg(resolvedBadgeType.value, previewFieldValues.value, printSettings.cardWidthMm, printSettings.cardHeightMm, printSettings.dpi)
  const pages = printSettings.doubleSided ? [svg, svg] : [svg]
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

async function downloadSvg() {
  await downloadBadgeSvg(resolvedBadgeType.value, previewFieldValues.value, badgeTypeName.value)
}

async function downloadPdf() {
  await downloadBadgePdf(resolvedBadgeType.value, previewFieldValues.value, badgeTypeName.value)
}
</script>

<template>
  <div class="flex flex-col items-center gap-8 p-8">
    <Fieldset legend="Badge Values" class="w-full">
      <div class="flex flex-col items-center gap-4 p-2">
        <div class="flex flex-wrap gap-6">
          <label v-if="hasIdField" class="flex flex-col text-sm text-slate-600">ID <InputText v-model="idValue" class="p-0" /></label>
          <label v-if="hasNicknameField" class="flex flex-col text-sm text-slate-600">Nickname <InputText v-model="nicknameValue" :maxlength="NAME_MAX_LENGTH" class="p-0" /></label>
          <label v-if="hasCountryField" class="flex flex-col text-sm text-slate-600">Country <InputText v-model="countryValue" class="p-0" /></label>
          <label v-for="field in attendeeSourcedCustomFields" :key="field.id" class="flex flex-col text-sm text-slate-600">
            {{ field.label }}
            <InputText :model-value="customValues[field.id] ?? ''" class="p-0" @update:model-value="(value: string) => { customValues[field.id] = value }" />
          </label>
        </div>
        <div class="flex gap-2">
          <Button label="Print Badge" @click="printBadge" />
          <Button label="Download SVG" severity="secondary" @click="downloadSvg" />
          <Button label="Download PDF" severity="secondary" @click="downloadPdf" />
        </div>
      </div>
    </Fieldset>

    <Fieldset legend="Preview" class="flex w-full flex-col items-center">
      <BadgePreviewCanvas
        v-model:fields="fields"
        :resolved-badge-type="resolvedBadgeType"
        :field-values="previewFieldValues"
        @drag-start="emit('field-drag-start')"
        @drag-end="emit('field-drag-end')"
      />
    </Fieldset>

    <Fieldset legend="Badge Setup" class="flex w-full flex-col items-center">
      <div class="flex flex-col gap-4 p-2 w-full">
        <div class="flex items-center gap-3 text-sm text-slate-600">
          <span>Name</span>
          <InputText v-model="badgeTypeName" class="p-0" />
          <span>Linked Badge Type</span>
          <Select
            :model-value="parentId"
            :options="availableParentOptions"
            option-label="name"
            option-value="id"
            placeholder="None"
            show-clear
            @update:model-value="setParentId"
            class="w-56"
          />
        </div>
        <Fieldset class="p-2">
          <template #legend>
            <div class="flex items-center gap-2">
              <span>Background</span>
              <label v-if="badgeType.parentId" class="flex items-center gap-1 text-xs font-normal text-slate-500">
                <ToggleSwitch v-model="badgeType.inherit.background" /> Inherit
              </label>
            </div>
          </template>
          <BadgeBackgroundSetup
            v-model="background"
            :disabled="badgeType.inherit.background"
          />
        </Fieldset>
        <Fieldset legend="Fields" class="p-2 flex flex-col items-start">
          <BadgeFieldTable
            v-model:fields="fields"
            :has-parent="badgeType.parentId !== null"
            :resolved-custom-fields="resolvedCustomFields"
            :resolved-custom-barcodes="resolvedCustomBarcodes"
            :sample-id-value="idValue"
          />
        </Fieldset>
      </div>
    </Fieldset>
  </div>
</template>
