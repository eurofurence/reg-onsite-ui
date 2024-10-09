<template>
  <div :class="fieldCSS" class="w-24">
    <label :for="componentId" :class="fieldLabelCSS">Registration Number</label>
    <InputNumber
      v-if="modelValue"
      :id="componentId"
      :class="fieldTextCSS + ' text-right'"
      :useGrouping="false"
      v-model="modelValue"
      v-bind="$attrs"
    />
    <FieldPlaceholder width="6rem" :labelId="componentId" v-else />
  </div>
</template>

<script setup lang="ts">
import {
  fieldCSS,
  fieldLabelCSS,
  fieldTextCSS,
} from "@/components/field/common/common";
import type { ModelRef } from "vue";

const modelValue: ModelRef<number | null> = defineModel<number | null>({
  required: true,
});
const componentId: string = generateId(useId());
</script>
