<script setup lang="ts">
import InputNumber from '@/volt/InputNumber.vue'
import { computed } from 'vue'

const props = defineProps<{
  modelValue: number
  unitsPerFull: number | null
  min?: number
  max?: number
  maxFractionDigits?: number
  suffix?: string
  inputClass?: string
  disabled?: boolean
}>()
const emit = defineEmits<{ 'update:modelValue': [value: number] }>()

function toDisplay(v: number): number {
  return props.unitsPerFull != null ? v / 100 * props.unitsPerFull : v
}

function fromDisplay(v: number): number {
  return props.unitsPerFull != null ? v / props.unitsPerFull * 100 : v
}

const displayValue = computed(() => toDisplay(props.modelValue))
const displayMin = computed(() => props.min != null ? toDisplay(props.min) : undefined)
const displayMax = computed(() => props.max != null ? toDisplay(props.max) : undefined)

function onUpdate(value: number | null) {
  const raw = fromDisplay(value ?? 0)
  const clamped = Math.min(Math.max(raw, props.min ?? raw), props.max ?? raw)
  emit('update:modelValue', clamped)
}
</script>

<template>
  <InputNumber
    :model-value="displayValue"
    :min="displayMin"
    :max="displayMax"
    :max-fraction-digits="maxFractionDigits"
    :suffix="suffix"
    :input-class="inputClass"
    :disabled="disabled"
    @update:model-value="onUpdate"
  />
</template>
