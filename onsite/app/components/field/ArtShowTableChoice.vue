<template>
  <div :class="fieldCSS + ' w-40'">
    <label :for="componentId" :class="fieldLabelCSS">Art Show Tables</label>
    <Select
      :id="componentId"
      :class="fieldTextCSS"
      v-model="panelChoice"
      :options="setupArtShowTables"
      optionValue="value"
      optionLabel="label"
      :placeholder="setupArtShowTablesPlaceholder.label"
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
  type ArtShowTableValue,
  setupArtShowTables,
  setupArtShowTablesPlaceholder,
} from "@/config/setupArtShowTables";
import type { PackageApiValue, PackageCountType } from "@/types/external";
import type { WritableComputedRef } from "vue";
import type { ModelRef } from "vue";

const modelValue: ModelRef<PackageCountType<PackageApiValue>[]> = defineModel<
  PackageCountType<PackageApiValue>[]
>({ required: true });
const panelChoice: WritableComputedRef<ArtShowTableValue | null> =
  computePackageChoice(modelValue, setupArtShowTables);
const componentId: string = generateId(useId());
</script>
