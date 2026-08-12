<script setup lang="ts">
import BadgeBackgroundSetup from '@/components/badge/BadgeBackgroundSetup.vue'
import BadgeFieldTable from '@/components/badge/BadgeFieldTable.vue'
import BadgePreviewCanvas from '@/components/badge/BadgePreviewCanvas.vue'
import { clampSquarePosAndSize } from '@/components/badge/badgeFieldUtils'
import { renderBadgeHtml } from '@/composables/print/badgeHtml'
import { printBadgePages } from '@/composables/print/printFrame'
import { localPrintSettingsStore } from '@/composables/services/printSettingsStore'
import type { BackgroundAlignH, BackgroundAlignV, BackgroundFit, BadgeType, BadgeTypeFields } from '@/types/badgeType'
import { buildPageSizeCss, getOrientedPageDimensionsMm } from '@/types/printSettings'
import Button from '@/volt/Button.vue'
import Fieldset from '@/volt/Fieldset.vue'
import InputText from '@/volt/InputText.vue'
import { computed, ref, watch, watchEffect } from 'vue'

const emit = defineEmits<{ applyToAll: [fields: BadgeTypeFields] }>()

const BG_FIT_SIZE: Record<BackgroundFit, string> = {
  cover: 'cover', contain: 'contain', fill: '100% 100%', 'fit-width': '100% auto', 'fit-height': 'auto 100%',
}

const NAME_MAX_LENGTH = 100

const badgeType = defineModel<BadgeType>({ required: true })
const idValue = defineModel<string>('idValue', { default: '123456' })
const nameValue = defineModel<string>('nameValue', { default: 'John Doe' })
const countryValue = defineModel<string>('countryValue', { default: 'USA' })

const backgroundUrl = ref('')
const backgroundFit = ref<BackgroundFit>('cover')
const backgroundAlignH = ref<BackgroundAlignH>('center')
const backgroundAlignV = ref<BackgroundAlignV>('center')
const backgroundColor = ref('ffffff')

const bgStyle = computed(() => ({
  backgroundColor: `#${backgroundColor.value}`,
  backgroundImage: backgroundUrl.value ? `url('${backgroundUrl.value}')` : 'none',
  backgroundSize: BG_FIT_SIZE[backgroundFit.value],
  backgroundPosition: `${backgroundAlignH.value} ${backgroundAlignV.value}`,
  backgroundRepeat: 'no-repeat',
}))

function defaultFields(): BadgeTypeFields {
  return {
    id: { pos: { x: 10, y: 70 }, size: { width: 30, height: 12 }, enabled: true, color: '334155', align: 'left', fontUrl: '' },
    name: { pos: { x: 10, y: 85 }, size: { width: 40, height: 12 }, enabled: true, color: '0f172a', align: 'left', fontUrl: '' },
    country: { pos: { x: 10, y: 55 }, size: { width: 30, height: 12 }, enabled: true, color: '0f172a', align: 'left', fontUrl: '' },
    datamatrix: { ...clampSquarePosAndSize({ x: 55, y: 10 }, 25), enabled: true, inverted: false },
  }
}

const fields = ref<BadgeTypeFields>(defaultFields())
const badgeTypeId = ref(badgeType.value.id)
const badgeTypeName = ref(badgeType.value.name)

watch(() => badgeType.value.name, (name) => { badgeTypeName.value = name })

watch(() => badgeType.value.id, () => {
  badgeTypeId.value = badgeType.value.id
  badgeTypeName.value = badgeType.value.name
  backgroundUrl.value = badgeType.value.backgroundUrl
  backgroundFit.value = badgeType.value.backgroundFit ?? 'cover'
  backgroundAlignH.value = badgeType.value.backgroundAlignH ?? 'center'
  backgroundAlignV.value = badgeType.value.backgroundAlignV ?? 'center'
  backgroundColor.value = badgeType.value.backgroundColor ?? 'ffffff'
  fields.value = badgeType.value.fields
}, { immediate: true })

watchEffect(() => {
  badgeType.value = {
    id: badgeTypeId.value,
    name: badgeTypeName.value,
    backgroundUrl: backgroundUrl.value,
    backgroundFit: backgroundFit.value,
    backgroundAlignH: backgroundAlignH.value,
    backgroundAlignV: backgroundAlignV.value,
    backgroundColor: backgroundColor.value,
    fields: fields.value,
  }
})

async function printBadge() {
  const printSettings = localPrintSettingsStore.load()
  const html = await renderBadgeHtml(badgeType.value, idValue.value, nameValue.value, countryValue.value, printSettings.orientation === 'portrait', printSettings.dpi)
  const pages = printSettings.doubleSided ? [html, html] : [html]
  const pageDimensions = getOrientedPageDimensionsMm(printSettings)
  printBadgePages(pages, buildPageSizeCss(printSettings), pageDimensions.width, pageDimensions.height)
}
</script>

<template>
  <div class="flex flex-col items-center gap-8 p-8">
    <Fieldset legend="Badge Values" class="w-full">
      <div class="flex flex-col items-center gap-4 p-2">
        <div class="flex gap-6">
          <label class="flex flex-col text-sm text-slate-600">ID <InputText v-model="idValue" class="p-0" /></label>
          <label class="flex flex-col text-sm text-slate-600">Name <InputText v-model="nameValue" :maxlength="NAME_MAX_LENGTH" class="p-0" /></label>
          <label class="flex flex-col text-sm text-slate-600">Country <InputText v-model="countryValue" class="p-0" /></label>
        </div>
        <Button label="Print Badge" @click="printBadge" />
      </div>
    </Fieldset>

    <Fieldset legend="Preview" class="flex w-full flex-col items-center">
      <BadgePreviewCanvas v-model:fields="fields" :idValue="idValue" :nameValue="nameValue" :countryValue="countryValue" :bgStyle="bgStyle" />
    </Fieldset>

    <Fieldset legend="Badge Setup" class="flex w-full flex-col items-center">
      <div class="flex flex-col gap-4 p-2 w-full">
        <div class="flex items-center gap-3 text-sm text-slate-600">
          <span>Name</span>
          <InputText v-model="badgeTypeName" class="p-0" />
        </div>
        <Fieldset legend="Background" class="p-2">
          <BadgeBackgroundSetup
            v-model:backgroundUrl="backgroundUrl"
            v-model:backgroundFit="backgroundFit"
            v-model:backgroundAlignH="backgroundAlignH"
            v-model:backgroundAlignV="backgroundAlignV"
            v-model:backgroundColor="backgroundColor"
          />
        </Fieldset>
        <Fieldset legend="Fields" class="p-2 flex flex-col items-center">
          <BadgeFieldTable v-model:fields="fields" @apply-to-all="emit('applyToAll', $event)" />
        </Fieldset>
      </div>
    </Fieldset>
  </div>
</template>
