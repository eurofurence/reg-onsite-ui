<template>
  <div :class="getDivClass()">
    <label :for="componentId" :class="fieldLabelCSS">{{ props.label }}</label>
    <InputText
      :id="componentId"
      :class="fieldTextCSS"
      v-model="modelValue"
      v-bind="$attrs"
      v-if="modelValue"
    />
    <FieldPlaceholder
      :width="getPlaceholderWidth()"
      :labelId="componentId"
      v-else
    />
  </div>
</template>

<script setup lang="ts">
import {
  fieldCSS,
  fieldLabelCSS,
  fieldTextCSS,
} from "@/components/field/common/common";
import type { ModelRef } from "vue";

function getDivClass() {
  const width: number = props.widthInRem * 4;
  return `${fieldCSS} w-${width}`;
}

function getPlaceholderWidth() {
  return `${props.widthInRem}rem`;
}

interface Props {
  label: string;
  widthInRem: number;
}
const props: Props = defineProps<Props>();

defineOptions({
  inheritAttrs: false,
});

const modelValue: ModelRef<string | null> = defineModel<string | null>({
  required: true,
});
const componentId: string = generateId(useId());
</script>
