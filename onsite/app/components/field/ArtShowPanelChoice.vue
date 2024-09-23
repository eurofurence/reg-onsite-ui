<template>
  <div :class="fieldCSS + ' w-40'">
    <label :for="componentId" :class="fieldLabelCSS">Art Show Panels</label>
    <Select
      :id="componentId"
      :class="fieldTextCSS"
      v-model="panelChoice"
      :options="setupArtShowPanels"
      optionValue="value"
      optionLabel="label"
      :placeholder="setupArtShowPanelsPlaceholder.label"
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
import {
  type ArtShowPanelValue,
  setupArtShowPanels,
  setupArtShowPanelsPlaceholder,
} from "@/config/packages/setupArtShowPanels";
import type { PackageApiValue, PackageCountType } from "@/types/external";
import type { WritableComputedRef } from "vue";
import type { ModelRef } from "vue";

const modelValue: ModelRef<PackageCountType<PackageApiValue>[]> = defineModel<
  PackageCountType<PackageApiValue>[]
>({ required: true });
const panelChoice: WritableComputedRef<ArtShowPanelValue | null> =
  computePackageChoice(modelValue, setupArtShowPanels);
const componentId: string = generateId(useId());
</script>
