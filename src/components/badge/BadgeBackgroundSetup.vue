<script setup lang="ts">
import type { BackgroundAlignH, BackgroundAlignV, BackgroundFit, BadgeTypeBackground } from '@/types/badgeType'
import Button from '@/volt/Button.vue'
import Select from '@/volt/Select.vue'
import SelectButton from '@/volt/SelectButton.vue'
import UrlInputText from '@/components/badge/UrlInputText.vue'
import { ref, onUnmounted } from 'vue'

const BG_FIT_OPTIONS: BackgroundFit[] = ['cover', 'contain', 'fill', 'fit-width', 'fit-height']
const BG_FIT_LABELS: Record<BackgroundFit, string> = { cover: 'Cover', contain: 'Contain', fill: 'Stretch', 'fit-width': 'Fit Width', 'fit-height': 'Fit Height' }
const BG_FIT_OPTION_OBJECTS = BG_FIT_OPTIONS.map(v => ({ label: BG_FIT_LABELS[v], value: v }))
const BG_ALIGN_H_OPTIONS: BackgroundAlignH[] = ['left', 'center', 'right']
const BG_ALIGN_V_OPTIONS: BackgroundAlignV[] = ['top', 'center', 'bottom']

defineProps<{ disabled?: boolean }>()

const background = defineModel<BadgeTypeBackground>({ required: true })

const backgroundFileInput = ref<HTMLInputElement | null>(null)
let backgroundObjectUrl: string | null = null

onUnmounted(() => {
  if (backgroundObjectUrl) URL.revokeObjectURL(backgroundObjectUrl)
})

function pickBackgroundFile() { backgroundFileInput.value?.click() }

function onBackgroundFileChange(event: Event) {
  const file = (event.target as HTMLInputElement).files?.[0]
  if (!file) return
  if (backgroundObjectUrl) URL.revokeObjectURL(backgroundObjectUrl)
  backgroundObjectUrl = URL.createObjectURL(file)
  background.value.url = backgroundObjectUrl
}

</script>

<template>
  <div class="flex items-center gap-3 self-start text-sm text-slate-600" :class="disabled ? 'opacity-50 pointer-events-none' : ''">
    <span>Background</span>
    <input type="color" :value="`#${background.color}`" class="h-8 w-8 cursor-pointer rounded border border-slate-300" @input="background.color = ($event.target as HTMLInputElement).value.slice(1)" />
    <UrlInputText v-model="background.url" class="p-0" placeholder="https://..." />
    <Button label="Browse..." size="small" @click="pickBackgroundFile" />
    <input ref="backgroundFileInput" type="file" accept="image/*" class="hidden" @change="onBackgroundFileChange" />
    <Select v-model="background.fit" :options="BG_FIT_OPTION_OBJECTS" option-label="label" option-value="value" class="w-32" />
    <span>H</span>
    <SelectButton v-model="background.alignH" :options="BG_ALIGN_H_OPTIONS" :allow-empty="false" />
    <span>V</span>
    <SelectButton v-model="background.alignV" :options="BG_ALIGN_V_OPTIONS" :allow-empty="false" />
  </div>
</template>
