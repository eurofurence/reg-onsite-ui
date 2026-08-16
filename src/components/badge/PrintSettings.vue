<script setup lang="ts">
import type { RestErrorHandler } from '@/composables/api/base/restErrorWrapper'
import { getCardFootprint } from '@/composables/print/cardFootprint'
import { forceRefreshBadgeMediaCache } from '@/composables/badge/revalidateBadgeMediaUrls'
import { exportBadgeConfig, importBadgeConfig } from '@/composables/services/badgeConfigExport'
import { badgeTypesRef, saveBadgeConfig } from '@/composables/services/badgeConfigStore'
import { getOrientedPageDimensionsMm, PAGE_SIZE_DIMENSIONS_MM } from '@/types/printSettings'
import type { CardRotationDeg, Dpi, Orientation, PageSize, PresetPageSize, PrintSettings } from '@/types/printSettings'
import Button from '@/volt/Button.vue'
import Fieldset from '@/volt/Fieldset.vue'
import InputNumber from '@/volt/InputNumber.vue'
import Select from '@/volt/Select.vue'
import SelectButton from '@/volt/SelectButton.vue'
import ToggleSwitch from '@/volt/ToggleSwitch.vue'
import { computed, ref, watch } from 'vue'

const props = defineProps<{ errorHandler: RestErrorHandler }>()

const printSettings = defineModel<PrintSettings>({ required: true })

watch(printSettings, () => {
  saveBadgeConfig(props.errorHandler)
}, { deep: true })

const importInput = ref<HTMLInputElement | null>(null)

function triggerImport() {
  importInput.value?.click()
}

async function handleImport(event: Event) {
  const input = event.target as HTMLInputElement
  const file = input.files?.[0]
  if (!file) {
    return
  }
  await importBadgeConfig(file, props.errorHandler)
  input.value = ''
}

const refreshingCache = ref(false)

async function handleRefreshCache() {
  refreshingCache.value = true
  try {
    await forceRefreshBadgeMediaCache(badgeTypesRef.value, props.errorHandler)
  } finally {
    refreshingCache.value = false
  }
}

type CardSizePreset = 'CreditCard' | 'A7' | 'A6' | 'Custom'

const CARD_SIZE_DIMENSIONS_MM: Record<Exclude<CardSizePreset, 'Custom'>, { width: number; height: number }> = {
  CreditCard: { width: 85.6, height: 54 },
  A7: { width: 74, height: 105 },
  A6: { width: 105, height: 148 },
}
const CARD_SIZE_LABELS: Record<CardSizePreset, string> = {
  CreditCard: 'Credit Card (85.6 × 54 mm)',
  A7: 'A7 (74 × 105 mm)',
  A6: 'A6 (105 × 148 mm)',
  Custom: 'Custom',
}
const CARD_SIZE_OPTIONS: CardSizePreset[] = ['CreditCard', 'A7', 'A6', 'Custom']

function matchCardSizePreset(widthMm: number, heightMm: number): Exclude<CardSizePreset, 'Custom'> | null {
  const match = (Object.keys(CARD_SIZE_DIMENSIONS_MM) as Exclude<CardSizePreset, 'Custom'>[]).find((preset) => {
    const { width, height } = CARD_SIZE_DIMENSIONS_MM[preset]
    return (width === widthMm && height === heightMm) || (width === heightMm && height === widthMm)
  })
  return match ?? null
}

const selectedCardSizePreset = computed<CardSizePreset>(() => {
  const { cardWidthMm, cardHeightMm } = printSettings.value
  return matchCardSizePreset(cardWidthMm, cardHeightMm) ?? 'Custom'
})

function applyCardSizePreset(preset: CardSizePreset) {
  if (preset === 'Custom') {
    return
  }
  const { width, height } = CARD_SIZE_DIMENSIONS_MM[preset]
  printSettings.value.cardWidthMm = width
  printSettings.value.cardHeightMm = height
}

const PAGE_SIZE_LABELS: Record<PageSize, string> = {
  A4: 'A4',
  Letter: 'Letter',
  Legal: 'Legal',
  CreditCard: 'Credit Card (85.6 × 54 mm)',
  Custom: 'Custom',
}
const PAGE_SIZE_OPTIONS: PageSize[] = ['A4', 'Letter', 'Legal', 'CreditCard', 'Custom']
const ORIENTATION_OPTIONS: Orientation[] = ['portrait', 'landscape']
const DPI_VALUES: Dpi[] = [150, 300, 600, 1200]
const DPI_OPTIONS: { label: string; value: Dpi }[] = DPI_VALUES.map((dpi) => ({
  label: `${dpi} DPI`,
  value: dpi,
}))
const CARD_ROTATION_OPTIONS: { label: string; value: CardRotationDeg }[] = [
  { label: '0°', value: 0 },
  { label: '90°', value: 90 },
  { label: '180°', value: 180 },
  { label: '270°', value: 270 },
]

const DIAGRAM_WIDTH_PX = 240

const pageDimensions = computed(() => getOrientedPageDimensionsMm(printSettings.value))
const diagramAspectRatio = computed(() => `${pageDimensions.value.width} / ${pageDimensions.value.height}`)

function matchPresetPageSize(widthMm: number, heightMm: number): { pageSize: PresetPageSize; orientation: Orientation } | null {
  for (const [pageSize, dimensions] of Object.entries(PAGE_SIZE_DIMENSIONS_MM) as [PresetPageSize, { width: number; height: number }][]) {
    const naturalOrientation: Orientation = dimensions.width > dimensions.height ? 'landscape' : 'portrait'
    if (dimensions.width === widthMm && dimensions.height === heightMm) {
      return { pageSize, orientation: naturalOrientation }
    }
    if (dimensions.width === heightMm && dimensions.height === widthMm) {
      return { pageSize, orientation: naturalOrientation === 'landscape' ? 'portrait' : 'landscape' }
    }
  }
  return null
}

function applyPageDimensionsMm(widthMm: number, heightMm: number) {
  const match = matchPresetPageSize(widthMm, heightMm)
  printSettings.value.customPageWidthMm = widthMm
  printSettings.value.customPageHeightMm = heightMm
  printSettings.value.pageSize = match?.pageSize ?? 'Custom'
  printSettings.value.orientation = match?.orientation ?? printSettings.value.orientation
}

const pageWidthMm = computed<number>({
  get: () => pageDimensions.value.width,
  set: (widthMm) => applyPageDimensionsMm(widthMm, pageDimensions.value.height),
})
const pageHeightMm = computed<number>({
  get: () => pageDimensions.value.height,
  set: (heightMm) => applyPageDimensionsMm(pageDimensions.value.width, heightMm),
})

function isQuarterTurned(cardRotationDeg: CardRotationDeg): boolean {
  return cardRotationDeg === 90 || cardRotationDeg === 270
}

const cardFootprint = computed(() => getCardFootprint(
  printSettings.value.cardXMm,
  printSettings.value.cardYMm,
  printSettings.value.cardWidthMm,
  printSettings.value.cardHeightMm,
  printSettings.value.cardRotationDeg,
))

const maxCardXMm = computed(() => Math.max(0, pageDimensions.value.width - cardFootprint.value.footprintWidthMm))
const maxCardYMm = computed(() => Math.max(0, pageDimensions.value.height - cardFootprint.value.footprintHeightMm))
const maxCardWidthMm = computed(() => isQuarterTurned(printSettings.value.cardRotationDeg) ? pageDimensions.value.height : pageDimensions.value.width)
const maxCardHeightMm = computed(() => isQuarterTurned(printSettings.value.cardRotationDeg) ? pageDimensions.value.width : pageDimensions.value.height)

function buildCardDiagramStyle(extraRotationDeg: number) {
  const { imgLeftMm, imgTopMm } = cardFootprint.value
  const { cardWidthMm, cardHeightMm, cardRotationDeg, cardBorderRadiusMm } = printSettings.value
  const { width: pageWidthMm, height: pageHeightMm } = pageDimensions.value
  const totalRotationDeg = cardRotationDeg + extraRotationDeg
  return {
    left: `${(imgLeftMm / pageWidthMm) * 100}%`,
    top: `${(imgTopMm / pageHeightMm) * 100}%`,
    width: `${(cardWidthMm / pageWidthMm) * 100}%`,
    height: `${(cardHeightMm / pageHeightMm) * 100}%`,
    borderRadius: `${(cardBorderRadiusMm / pageWidthMm) * 100}%`,
    transform: totalRotationDeg !== 0 ? `rotate(${totalRotationDeg}deg)` : undefined,
    transformOrigin: 'center',
  }
}

const frontCardDiagramStyle = computed(() => buildCardDiagramStyle(0))
const backCardDiagramStyle = computed(() => buildCardDiagramStyle(printSettings.value.backSideRotated180 ? 180 : 0))

// Handler instead of a `watch` so a bulk config load can't retrigger this.
function setOrientation(orientation: Orientation) {
  const deltaDeg = orientation === 'portrait' ? 90 : -90
  printSettings.value.cardRotationDeg = (((printSettings.value.cardRotationDeg + deltaDeg) % 360 + 360) % 360) as CardRotationDeg
  printSettings.value.orientation = orientation
}

function centerCardOnPage() {
  const { footprintWidthMm, footprintHeightMm } = cardFootprint.value
  printSettings.value.cardXMm = (pageDimensions.value.width - footprintWidthMm) / 2
  printSettings.value.cardYMm = (pageDimensions.value.height - footprintHeightMm) / 2
}

function setPageSize(pageSize: PageSize) {
  printSettings.value.pageSize = pageSize
  centerCardOnPage()
}

watch(
  () => [
    pageDimensions.value.width,
    pageDimensions.value.height,
    printSettings.value.cardWidthMm,
    printSettings.value.cardHeightMm,
    printSettings.value.cardRotationDeg,
    printSettings.value.cardXMm,
    printSettings.value.cardYMm,
  ] as const,
  ([pageWidthMm, pageHeightMm, cardWidthMm, cardHeightMm, cardRotationDeg, cardXMm, cardYMm]) => {
    const quarterTurned = isQuarterTurned(cardRotationDeg)
    const maxWidthMm = quarterTurned ? pageHeightMm : pageWidthMm
    const maxHeightMm = quarterTurned ? pageWidthMm : pageHeightMm
    const clampedWidthMm = Math.min(cardWidthMm, maxWidthMm)
    const clampedHeightMm = Math.min(cardHeightMm, maxHeightMm)
    if (clampedWidthMm !== cardWidthMm) printSettings.value.cardWidthMm = clampedWidthMm
    if (clampedHeightMm !== cardHeightMm) printSettings.value.cardHeightMm = clampedHeightMm

    const footprintWidthMm = quarterTurned ? clampedHeightMm : clampedWidthMm
    const footprintHeightMm = quarterTurned ? clampedWidthMm : clampedHeightMm
    const maxXMm = Math.max(0, pageWidthMm - footprintWidthMm)
    const maxYMm = Math.max(0, pageHeightMm - footprintHeightMm)
    const clampedXMm = Math.min(Math.max(cardXMm, 0), maxXMm)
    const clampedYMm = Math.min(Math.max(cardYMm, 0), maxYMm)
    if (clampedXMm !== cardXMm) printSettings.value.cardXMm = clampedXMm
    if (clampedYMm !== cardYMm) printSettings.value.cardYMm = clampedYMm
  },
  { immediate: true, flush: 'sync' },
)
</script>

<template>
  <div class="flex flex-col gap-6 p-8">
    <div class="flex flex-col gap-6 md:flex-row md:items-start">
      <div class="flex flex-1 flex-col gap-6">
        <Fieldset legend="Page" class="w-full">
          <div class="flex flex-wrap items-end gap-6 p-2">
            <label class="flex flex-col gap-2 text-sm text-slate-600">
              Page Size
              <Select
                :model-value="printSettings.pageSize"
                :options="PAGE_SIZE_OPTIONS"
                :option-label="(option) => PAGE_SIZE_LABELS[option as PageSize]"
                class="w-60"
                @update:model-value="setPageSize"
              />
            </label>

            <label class="flex flex-col gap-2 text-sm text-slate-600">
              Page Width
              <InputNumber v-model="pageWidthMm" :min="1" :max-fraction-digits="2" suffix=" mm" input-class="w-24" />
            </label>
            <label class="flex flex-col gap-2 text-sm text-slate-600">
              Page Height
              <InputNumber v-model="pageHeightMm" :min="1" :max-fraction-digits="2" suffix=" mm" input-class="w-24" />
            </label>

            <label class="flex flex-col gap-2 text-sm text-slate-600">
              Orientation
              <SelectButton
                :model-value="printSettings.orientation"
                :options="ORIENTATION_OPTIONS"
                :allow-empty="false"
                @update:model-value="setOrientation"
              />
            </label>
          </div>
        </Fieldset>

        <Fieldset legend="Card Size &amp; Position" class="w-full">
          <div class="flex flex-col gap-6 p-2">
            <div class="flex flex-wrap items-end gap-6">
              <label class="flex flex-col gap-2 text-sm text-slate-600">
                Card Size
                <Select
                  :model-value="selectedCardSizePreset"
                  :options="CARD_SIZE_OPTIONS"
                  :option-label="(option) => CARD_SIZE_LABELS[option as CardSizePreset]"
                  class="w-60"
                  @update:model-value="applyCardSizePreset"
                />
              </label>
              <label class="flex flex-col gap-2 text-sm text-slate-600">
                Width
                <InputNumber v-model="printSettings.cardWidthMm" :min="1" :max="maxCardWidthMm" :max-fraction-digits="2" suffix=" mm" input-class="w-24" />
              </label>
              <label class="flex flex-col gap-2 text-sm text-slate-600">
                Height
                <InputNumber v-model="printSettings.cardHeightMm" :min="1" :max="maxCardHeightMm" :max-fraction-digits="2" suffix=" mm" input-class="w-24" />
              </label>
              <label class="flex flex-col gap-2 text-sm text-slate-600">
                Border Radius
                <InputNumber v-model="printSettings.cardBorderRadiusMm" :min="0" :max-fraction-digits="2" suffix=" mm" input-class="w-24" />
              </label>
            </div>

            <div class="flex flex-wrap items-end gap-6">
              <label class="flex flex-col gap-2 text-sm text-slate-600">
                Position X
                <InputNumber v-model="printSettings.cardXMm" :min="0" :max="maxCardXMm" :max-fraction-digits="2" suffix=" mm" input-class="w-24" />
              </label>
              <label class="flex flex-col gap-2 text-sm text-slate-600">
                Position Y
                <InputNumber v-model="printSettings.cardYMm" :min="0" :max="maxCardYMm" :max-fraction-digits="2" suffix=" mm" input-class="w-24" />
              </label>
              <Button severity="secondary" outlined title="Center card on page" @click="centerCardOnPage">
                <i class="pi pi-arrows-alt" />
              </Button>
              <label class="flex flex-col gap-2 text-sm text-slate-600">
                Rotation
                <SelectButton
                  v-model="printSettings.cardRotationDeg"
                  :options="CARD_ROTATION_OPTIONS"
                  option-label="label"
                  option-value="value"
                  :allow-empty="false"
                />
              </label>
            </div>
          </div>
        </Fieldset>

        <Fieldset legend="Print Options" class="w-full">
          <div class="flex flex-col gap-6 p-2">
            <div class="flex flex-col gap-2">
              <span class="text-sm text-slate-600">DPI</span>
              <SelectButton
                v-model="printSettings.dpi"
                :options="DPI_OPTIONS"
                option-label="label"
                option-value="value"
                :allow-empty="false"
              />
            </div>

            <label class="flex items-center gap-2">
              <ToggleSwitch v-model="printSettings.doubleSided" />
              <span class="text-sm text-slate-600">Double-sided (print each badge twice)</span>
            </label>

            <label class="flex items-center gap-2">
              <ToggleSwitch v-model="printSettings.backSideRotated180" :disabled="!printSettings.doubleSided" />
              <span class="text-sm text-slate-600">Print back side 180° turned</span>
            </label>
          </div>
        </Fieldset>

        <Fieldset legend="Settings" class="w-full">
          <div class="flex gap-2 p-2">
            <Button label="Export Badge Config" size="small" severity="secondary" @click="exportBadgeConfig" />
            <Button label="Import Badge Config" size="small" severity="secondary" @click="triggerImport" />
            <Button
              label="Force Refresh Media Cache"
              size="small"
              severity="secondary"
              :loading="refreshingCache"
              :disabled="refreshingCache"
              @click="handleRefreshCache"
            />
            <input
              ref="importInput"
              type="file"
              accept="application/json"
              class="hidden"
              @change="handleImport"
            />
          </div>
        </Fieldset>
      </div>

      <Fieldset legend="Preview" class="w-96 flex-shrink-0 self-start">
        <div class="flex flex-col items-center gap-2 p-2">
          <div class="flex flex-col items-center gap-1">
            <span v-if="printSettings.doubleSided" class="text-xs text-slate-500">Front</span>
            <div
              class="relative flex-shrink-0 border border-slate-300 bg-white shadow-sm"
              :style="{ width: `${DIAGRAM_WIDTH_PX}px`, aspectRatio: diagramAspectRatio }"
            >
              <div class="absolute border border-dashed border-slate-500 bg-slate-200" :style="frontCardDiagramStyle">
                <i class="pi pi-arrow-up-left absolute left-1 top-1 text-base text-slate-600" title="Card's top-left corner" aria-hidden="true" />
              </div>
            </div>
          </div>
          <div v-if="printSettings.doubleSided" class="flex flex-col items-center gap-1">
            <span class="text-xs text-slate-500">Back</span>
            <div
              class="relative flex-shrink-0 border border-slate-300 bg-white shadow-sm"
              :style="{ width: `${DIAGRAM_WIDTH_PX}px`, aspectRatio: diagramAspectRatio }"
            >
              <div class="absolute border border-dashed border-slate-500 bg-slate-200" :style="backCardDiagramStyle">
                <i class="pi pi-arrow-up-left absolute left-1 top-1 text-base text-slate-600" title="Card's top-left corner" aria-hidden="true" />
              </div>
            </div>
          </div>
        </div>
      </Fieldset>
    </div>
  </div>
</template>
