<template>
  <div :class="fieldCSS">
    <label :for="componentId" :class="fieldLabelCSS">T-Shirt Size</label>
    <Select
      :id="componentId"
      :class="fieldTextCSS"
      class="w-40"
      v-model="modelValue"
      :options="setupTShirtSizes"
      optionValue="value"
      optionLabel="label"
      :placeholder="setupTShirtTypePlaceholder.label"
      v-bind="$attrs"
    >
    </Select>
  </div>
</template>

<script setup lang="ts">
import {
  fieldCSS,
  fieldLabelCSS,
  fieldTextCSS,
} from "@/components/field/common";
import {
  type TShirtSizeValue,
  setupTShirtSizes,
} from "@/config/tshirt/setupTShirtSizes";
import { setupTShirtTypePlaceholder } from "@/config/tshirt/setupTShirtTypes";
import type { ModelRef } from "vue";

const modelValue: ModelRef<TShirtSizeValue | undefined> = defineModel<
  TShirtSizeValue | undefined
>({ required: true });
const componentId: string = generateId(useId());
</script>
