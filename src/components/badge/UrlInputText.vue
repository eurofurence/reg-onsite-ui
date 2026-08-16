<script setup lang="ts">
// Text input that scrolls to show the tail of long URL values when unfocused.
import InputText from '@/volt/InputText.vue'
import { ref, watch, nextTick, onMounted, onBeforeUnmount } from 'vue'

const props = defineProps<{ modelValue: string; placeholder?: string; class?: string; disabled?: boolean }>()
const emit = defineEmits<{ 'update:modelValue': [value: string]; commit: [value: string] }>()

const inputRef = ref<InstanceType<typeof InputText> | null>(null)
let resizeObserver: ResizeObserver | undefined

function getInputEl() {
  return (inputRef.value as any)?.inputRef?.$el as HTMLInputElement | undefined
}

function scrollToEnd() {
  const input = getInputEl()
  if (input) input.scrollLeft = input.scrollWidth
}

function onBlur() {
  scrollToEnd()
  requestAnimationFrame(scrollToEnd)
  emit('commit', props.modelValue)
}

watch(() => props.modelValue, () => {
  nextTick(scrollToEnd)
})

onMounted(() => {
  nextTick(scrollToEnd)

  const input = getInputEl()
  if (input) {
    resizeObserver = new ResizeObserver(() => scrollToEnd())
    resizeObserver.observe(input)
  }
})

onBeforeUnmount(() => {
  resizeObserver?.disconnect()
})
</script>

<template>
  <InputText
    ref="inputRef"
    :model-value="modelValue"
    :class="props.class"
    :placeholder="placeholder"
    :disabled="disabled"
    @update:model-value="(value: string) => emit('update:modelValue', value)"
    @blur="onBlur"
  />
</template>
