<script setup lang="ts">
import { exportBadgeConfig, importBadgeConfig } from '@/composables/services/badgeConfigExport'
import { localPrintSettingsStore } from '@/composables/services/printSettingsStore'
import type { Dpi, Orientation, PageSize, PrintSettings } from '@/types/printSettings'
import Button from '@/volt/Button.vue'
import Fieldset from '@/volt/Fieldset.vue'
import SelectButton from '@/volt/SelectButton.vue'
import ToggleSwitch from '@/volt/ToggleSwitch.vue'
import { ref } from 'vue'

const printSettings = defineModel<PrintSettings>({ required: true })

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
  await importBadgeConfig(file)
  printSettings.value = localPrintSettingsStore.load()
  input.value = ''
}

const PAGE_SIZE_LABELS: Record<PageSize, string> = {
  A4: 'A4',
  Letter: 'Letter',
  Legal: 'Legal',
  CreditCard: 'Credit Card (85.6 × 54 mm)',
}
const PAGE_SIZE_OPTIONS: PageSize[] = ['A4', 'Letter', 'Legal', 'CreditCard']
const ORIENTATION_OPTIONS: Orientation[] = ['portrait', 'landscape']
const DPI_VALUES: Dpi[] = [150, 300, 600, 1200]
const DPI_OPTIONS: { label: string; value: Dpi }[] = DPI_VALUES.map((dpi) => ({
  label: `${dpi} DPI`,
  value: dpi,
}))
</script>

<template>
  <div class="flex flex-col gap-6 p-8">
    <Fieldset legend="Print Settings" class="w-full">
      <div class="flex flex-col gap-6 p-2">
        <div class="flex flex-col gap-2">
          <span class="text-sm text-slate-600">Page Size</span>
          <SelectButton
            v-model="printSettings.pageSize"
            :options="PAGE_SIZE_OPTIONS"
            :option-label="(option) => PAGE_SIZE_LABELS[option as PageSize]"
            :allow-empty="false"
          />
        </div>

        <div class="flex flex-col gap-2">
          <span class="text-sm text-slate-600">Orientation</span>
          <SelectButton
            v-model="printSettings.orientation"
            :options="ORIENTATION_OPTIONS"
            :allow-empty="false"
          />
        </div>

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
      </div>
    </Fieldset>

    <div class="flex gap-2">
      <Button label="Export Badge Config" size="small" severity="secondary" @click="exportBadgeConfig" />
      <Button label="Import Badge Config" size="small" severity="secondary" @click="triggerImport" />
      <input
        ref="importInput"
        type="file"
        accept="application/json"
        class="hidden"
        @change="handleImport"
      />
    </div>
  </div>
</template>
