<template>
  <div :class="fieldCSS">
    <label :for="componentId" :class="fieldLabelCSS">T-Shirt Size</label>
    <Select
      :id="componentId"
      :class="fieldTextCSS"
      v-model="modelValue"
      :options="getGroupedTShirtOptions()"
      optionGroupLabel="label"
      optionGroupChildren="children"
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
} from "@/components/field/common/common";
import { getGroupedTShirtOptions } from "@/composables/fields/tshirt/getGroupedTShirtOptions";
import {
  type TShirtTypeValue,
  setupTShirtTypePlaceholder,
} from "@/config/metadata/tshirt/metadataForTShirtTypes";
import type { ModelRef } from "vue";

const modelValue: ModelRef<TShirtTypeValue | null> =
  defineModel<TShirtTypeValue | null>({ required: true });
const componentId: string = generateId(useId());
</script>
