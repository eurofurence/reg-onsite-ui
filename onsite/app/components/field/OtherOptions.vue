<template>
  <div :class="fieldCSS">
    <label :for="componentId" :class="fieldLabelCSS">Other Options</label>
    <SelectButton
      :id="componentId"
      :class="fieldTextCSS"
      v-model="packageSubset"
      :options="setupOtherPackages"
      optionValue="value"
      optionLabel="label"
      multiple
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
import { computePackageSubset } from "@/composables/fields/packages/computePackageSubset";
import { setupOtherPackages } from "@/config/packages/setupOtherPackages";
import type { OtherPackageApiValue } from "@/config/packages/setupOtherPackages";
import type { PackageApiValue, PackageCountType } from "@/types/external";
import type { ModelRef } from "vue";
import type { WritableComputedRef } from "vue";

const modelValue: ModelRef<PackageCountType<PackageApiValue>[]> = defineModel<
  PackageCountType<PackageApiValue>[]
>({ required: true });
const packageSubset: WritableComputedRef<OtherPackageApiValue[] | null> =
  computePackageSubset(modelValue, setupOtherPackages);
const componentId: string = generateId(useId());
</script>
