<template>
  <div class="goodies-level-field" :class="fieldCSS">
    <label :for="componentId" :class="fieldLabelCSS">Goodies Level</label>
    <SelectButton
      :id="componentId"
      :class="fieldTextCSS"
      v-model="goodiesChoice"
      :pt:pc-toggle-button:root="getButtonStyle"
      :options="setupGoodiesLevels"
      optionValue="value"
      optionLabel="label"
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
import { computePackageChoice } from "@/composables/fields/packages/computePackageChoice";
import { getSelectedButtonStyle } from "@/composables/fields/packages/getSelectedButtonStyle";
import { setupGoodiesLevels } from "@/config/setupGoodiesLevels";
import type { GoodiesLevelValue } from "@/config/setupPackages";
import type { PackageApiValue, PackageCountType } from "@/types/external";
import type { SelectButtonPassThroughMethodOptions } from "primevue/selectbutton";
import type { ModelRef, WritableComputedRef } from "vue";

const modelValue: ModelRef<PackageCountType<PackageApiValue>[] | null> =
  defineModel<PackageCountType<PackageApiValue>[] | null>({ required: true });
const goodiesChoice: WritableComputedRef<GoodiesLevelValue | null> =
  computePackageChoice(modelValue, setupGoodiesLevels);
const componentId: string = generateId(useId());

function getButtonStyle(options: SelectButtonPassThroughMethodOptions) {
  return getSelectedButtonStyle(goodiesChoice, setupGoodiesLevels, options);
}
</script>
