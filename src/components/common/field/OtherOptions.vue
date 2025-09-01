<template>
  <div :class="fieldCSS">
    <label :for="componentId" :class="fieldLabelCSS">Other Options</label>
    <SelectButton
      :id="componentId"
      :class="fieldTextCSS"
      v-model="packageSubset"
      :pt:pcToggleButton:content="configureDefaultButtonStyle"
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
} from "@/components/common/field/common/common";
import { configureDefaultButtonStyle } from "@/composables/fields/configureButtonStyles";
import { computeInclusivePackagePresence } from "@/composables/fields/packages/computeInclusivePackagePresence";
import { generateId } from "@/composables/generateId";
import { getConventionSetup } from "@/composables/logic/getConventionSetup";
import { type BoatLevelValue } from "@/config/metadata/packages/metadataForBoatLevel";
import { type TicketTypeValue } from "@/config/metadata/packages/metadataForTicketType";
import type { PackageCountType } from "@/types/external/attsrv/attendees/attendee";
import type { LabeledValue } from "@/types/internal/infos";
import SelectButton from "@/volt/SelectButton.vue";
import type { ModelRef, WritableComputedRef } from "vue";
import { useId } from "vue";

const allOptions: LabeledValue<TicketTypeValue | BoatLevelValue>[] = [
  ...getConventionSetup().metadata.forTicketType.list,
  ...getConventionSetup().metadata.forBoatLevel.list,
];

const modelValue: ModelRef<PackageCountType[] | null> = defineModel<
  PackageCountType[] | null
>({ required: true });

const packageSubset: WritableComputedRef<
  (TicketTypeValue | BoatLevelValue)[] | null
> = computeInclusivePackagePresence(modelValue, allOptions);

const componentId: string = generateId(useId());
</script>
