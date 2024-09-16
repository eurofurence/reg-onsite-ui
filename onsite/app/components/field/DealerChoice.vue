<template>
  <div :class="fieldCSS + ' w-40'">
    <label :for="componentId" :class="fieldLabelCSS"
      >Dealer's Den Package</label
    >
    <Select
      :id="componentId"
      :class="fieldTextCSS"
      v-model="dealerPackageChoice"
      :options="setupDealerPackages"
      optionValue="value"
      optionLabel="label"
      :placeholder="setupDealerPackagesPlaceholder.label"
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
  type DealerTableValue,
  setupDealerPackages,
  setupDealerPackagesPlaceholder,
} from "@/config/setupDealerPackages";
import type { PackageApiValue, PackageCountType } from "@/types/external";
import type { WritableComputedRef } from "vue";
import type { ModelRef } from "vue";

const modelValue: ModelRef<PackageCountType<PackageApiValue>[]> = defineModel<
  PackageCountType<PackageApiValue>[]
>({ required: true });
const dealerPackageChoice: WritableComputedRef<DealerTableValue | null> =
  computePackageChoice(modelValue, setupDealerPackages);
const componentId: string = generateId(useId());
</script>
