<template>
  <div :class="fieldCSS">
    <label :for="componentId" :class="fieldLabelCSS">T-Shirt Size</label>
    <Select
      :id="componentId"
      :class="fieldTextCSS"
      class="w-40"
      v-model="modelValue"
      :options="getConventionSetup().metadata.forTShirtSizes.list"
      optionValue="value"
      optionLabel="label"
      :placeholder="metadataForTShirtTypePlaceholder.label"
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
} from "@/components/common/field/common/common";
import { generateId } from "@/composables/generateId";
import { getConventionSetup } from "@/composables/logic/getConventionSetup";
import { type TShirtSizeValue } from "@/config/metadata/tshirt/metadataForTShirtSizes";
import { metadataForTShirtTypePlaceholder } from "@/config/metadata/tshirt/metadataForTShirtTypes";
import Select from "@/volt/Select.vue";
import type { ModelRef } from "vue";
import { useId } from "vue";

const modelValue: ModelRef<TShirtSizeValue | undefined> = defineModel<
  TShirtSizeValue | undefined
>({ required: true });
const componentId: string = generateId(useId());
</script>
