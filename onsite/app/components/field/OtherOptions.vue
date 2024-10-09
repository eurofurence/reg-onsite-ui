<template>
  <div :class="fieldCSS">
    <label :for="componentId" :class="fieldLabelCSS">Other Options</label>
    <SelectButton
      :id="componentId"
      :class="fieldTextCSS"
      v-model="packageSubset"
      :options="allOptions"
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
} from "@/components/field/common/common";
import { computePackageSubset } from "@/composables/fields/packages/computePackageSubset";
import {
  type TicketTypeValue,
  metadataListForTicketType,
} from "@/config/metadata/packages/metadataForTicketType";
import type {
  PackageApiValue,
  PackageCountType,
} from "@/types/external/attsrv/attendees/attendee";
import type { ModelRef } from "vue";
import type { WritableComputedRef } from "vue";
import {
  type BoatLevelValue,
  metadataListForBoatLevel,
} from "@/config/metadata/packages/metadataForBoatLevel";
import type { LabeledValue } from "@/types/internal/infos";

const allOptions: LabeledValue<TicketTypeValue | BoatLevelValue>[] = [
  ...metadataListForTicketType,
  ...metadataListForBoatLevel,
];

const modelValue: ModelRef<PackageCountType<PackageApiValue>[] | null> =
  defineModel<PackageCountType<PackageApiValue>[] | null>({ required: true });

const packageSubset: WritableComputedRef<
  (TicketTypeValue | BoatLevelValue)[] | null
> = computePackageSubset(modelValue, allOptions);

const componentId: string = generateId(useId());
</script>
