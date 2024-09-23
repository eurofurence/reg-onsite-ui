<template>
  <div class="sponsor-level-field" :class="fieldCSS">
    <label :for="componentId" :class="fieldLabelCSS">Sponsor Level</label>
    <SelectButton
      :id="componentId"
      :class="fieldTextCSS"
      v-model="sponsorChoice"
      :pt:pc-toggle-button:root="getButtonStyle"
      :options="setupSponsorLevels"
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
import type { GoodiesLevelValue } from "@/config/packages/setupPackages";
import { setupSponsorLevels } from "@/config/packages/setupSponsorLevels";
import type { PackageApiValue, PackageCountType } from "@/types/external";
import type { SelectButtonPassThroughMethodOptions } from "primevue/selectbutton";
import type { ModelRef, WritableComputedRef } from "vue";

const modelValue: ModelRef<PackageCountType<PackageApiValue>[] | null> =
  defineModel<PackageCountType<PackageApiValue>[] | null>({ required: true });
const sponsorChoice: WritableComputedRef<GoodiesLevelValue | null> =
  computePackageChoice(modelValue, setupSponsorLevels);
const componentId: string = generateId(useId());

function getButtonStyle(options: SelectButtonPassThroughMethodOptions) {
  return getSelectedButtonStyle(sponsorChoice, setupSponsorLevels, options);
}
</script>
