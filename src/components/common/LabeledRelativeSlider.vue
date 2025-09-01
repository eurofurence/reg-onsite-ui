<template>
  <div class="flex flex-col gap-3">
    <label :for="componentId">{{ renderLabel(modelValue) }}</label>
    <Slider
      :id="componentId"
      v-model="modelValue"
      v-bind="$attrs"
      :step="props.step"
      :min="props.min"
      :max="props.max"
    />
  </div>
</template>

<script setup lang="ts">
import { generateId } from "@/composables/generateId";
import Slider from "@/volt/Slider.vue";
import { useId, type ModelRef } from "vue";

function renderLabel(value: number) {
  const roundedPercent: string = `${Math.round(
    (value * 100) / props.baseValue
  )}%`;
  if (props.withParens) {
    return `${props.label} (${roundedPercent})`;
  }
  return `${props.label} ${roundedPercent}`;
}

interface Props {
  label: string;
  baseValue: number;
  withParens: boolean;
  step: number;
  min: number;
  max: number;
}
const props: Props = defineProps<Props>();

defineOptions({
  inheritAttrs: false,
});

const modelValue: ModelRef<number> = defineModel<number>({
  required: true,
});
const componentId: string = generateId(useId());
</script>
