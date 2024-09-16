<template>
  <div :class="fieldCSS" class="w-24">
    <label :for="componentId" :class="fieldLabelCSS">Registration Number</label>
    <InputNumber
      :id="componentId"
      :class="fieldTextCSS + ' text-right'"
      :useGrouping="false"
      v-model="modelValue"
      v-bind="$attrs"
    />
  </div>
</template>

<script setup lang="ts">
import {
  fieldCSS,
  fieldLabelCSS,
  fieldTextCSS,
} from "@/components/field/common";
import type { ModelRef } from "vue";

const modelValue: ModelRef<number> = defineModel<number>({ required: true });
const componentId: string = generateId(useId());
</script>
