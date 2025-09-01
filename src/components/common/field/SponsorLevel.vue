<template>
  <div :class="fieldCSS">
    <label :for="componentId" :class="fieldLabelCSS">Sponsor Level</label>
    <SelectButton
      :id="componentId"
      :class="fieldTextCSS"
      v-model="sponsorChoice"
      class="h-12"
      :pt:pcToggleButton:content="
        configureAnnotatedButtonStyles(
          getConventionSetup().metadata.forSponsorLevels.list
        )
      "
      :options="getConventionSetup().metadata.forSponsorLevels.list"
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
} from "@/components/common/field/common/common";
import { configureAnnotatedButtonStyles } from "@/composables/fields/configureButtonStyles";
import { computeExclusivePackagePresence } from "@/composables/fields/packages/computeExclusivePackagePresence";
import { generateId } from "@/composables/generateId";
import { getConventionSetup } from "@/composables/logic/getConventionSetup";
import type { SponsorLevelValue } from "@/config/metadata/packages/metadataForPerks";
import type { PackageCountType } from "@/types/external/attsrv/attendees/attendee";
import SelectButton from "@/volt/SelectButton.vue";
import type { ModelRef, WritableComputedRef } from "vue";
import { useId } from "vue";

const modelValue: ModelRef<PackageCountType[] | null> = defineModel<
  PackageCountType[] | null
>({ required: true });

const sponsorChoice: WritableComputedRef<SponsorLevelValue | null> =
  computeExclusivePackagePresence(
    modelValue,
    getConventionSetup().metadata.forSponsorLevels.list
  );
const componentId: string = generateId(useId());
</script>
