<template>
  <div :class="getDivClass()">
    <label :for="componentId" :class="fieldLabelCSS">{{ props.label }}</label>
    <div class="m-px" v-if="modelValue || !props.showSkeleton">
      <InputText
        :id="componentId"
        :class="getInputClass()"
        class="h-12"
        v-model="modelValue"
        v-bind="$attrs"
      />
    </div>
    <div v-else>
      <Placeholder :width="getPlaceholderWidth()" :labelId="componentId" />
    </div>
  </div>
</template>

<script setup lang="ts">
import {
  fieldCSS,
  fieldLabelCSS,
  fieldTextCSS,
} from "@/components/common/field/common/common";
import Placeholder from "@/components/common/field/Placeholder.vue";
import { generateId } from "@/composables/generateId";
import InputText from "@/volt/InputText.vue";
import type { ModelRef } from "vue";
import { useId } from "vue";

function getDivClass() {
  if (modelValue.value === null) {
    return fieldCSS;
  }
  if (props.autoExpand && modelValue.value.length > props.autoExpand) {
    return fieldCSS;
  }
  const width: number = props.widthInRem * 4;
  return `${fieldCSS} min-w-${width}`;
}

function getInputClass() {
  if (modelValue.value === null) {
    return fieldTextCSS;
  }
  if (props.autoExpand && modelValue.value.length > props.autoExpand) {
    return fieldCSS;
  }
  const width: number = props.widthInRem * 4;
  return `${fieldTextCSS} w-${width}`;
}

function getPlaceholderWidth() {
  return `${props.widthInRem}rem`;
}

interface Props {
  label: string;
  widthInRem: number;
  showSkeleton?: boolean;
  autoExpand?: number;
}
const props = withDefaults(defineProps<Props>(), {
  showSkeleton: true,
  autoExpand: 10,
});

defineOptions({
  inheritAttrs: false,
});

const modelValue: ModelRef<string | null> = defineModel<string | null>({
  required: true,
});
const componentId: string = generateId(useId());
</script>
