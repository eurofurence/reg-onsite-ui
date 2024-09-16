<template>
  <div :class="fieldCSS">
    <label :for="componentId" :class="fieldLabelCSS">Zip Code</label>
    <InputText
      v-if="modelValue !== null"
      :id="componentId"
      :class="fieldTextCSS"
      class="w-48"
      v-model="modelValue"
      v-bind="$attrs"
    />
    <FieldPlaceholder width="12rem" :labelId="componentId" v-else />
  </div>
</template>

<script setup lang="ts">
import {
  fieldCSS,
  fieldLabelCSS,
  fieldTextCSS,
} from "@/components/field/common";
import type { ModelRef } from "vue";

const modelValue: ModelRef<string | null> = defineModel<string | null>({
  required: true,
});
const componentId: string = generateId(useId());
</script>
