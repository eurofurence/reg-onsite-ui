<template>
  <div :class="fieldCSS">
    <label :for="componentId" :class="fieldLabelCSS">Conbook</label>
    <SelectButton
      :id="componentId"
      v-model="conbookChoice"
      class="h-12"
      :pt:pcToggleButton:content="
        configureAnnotatedButtonStyles(
          getConventionSetup().metadata.forConBook.list
        )
      "
      :options="getConventionSetup().metadata.forConBook.list"
      optionValue="value"
      optionLabel="label"
    />
  </div>
</template>

<script setup lang="ts">
import {
  fieldCSS,
  fieldLabelCSS,
} from "@/components/common/field/common/common";
import { configureAnnotatedButtonStyles } from "@/composables/fields/configureButtonStyles";
import { computeExclusiveFlagPresence } from "@/composables/fields/flags/computeExclusiveFlagPresence";
import { generateId } from "@/composables/generateId";
import { getConventionSetup } from "@/composables/logic/getConventionSetup";
import { type ConBookValue } from "@/config/metadata/flags/metadataForConBookChoice";
import type { FlagApiValue } from "@/types/external/attsrv/attendees/attendee";
import SelectButton from "@/volt/SelectButton.vue";
import { useId, type ModelRef, type WritableComputedRef } from "vue";

const modelValue: ModelRef<FlagApiValue[] | null> = defineModel<
  FlagApiValue[] | null
>({
  required: true,
});
const conbookChoice: WritableComputedRef<ConBookValue | null> =
  computeExclusiveFlagPresence<ConBookValue>(
    modelValue,
    getConventionSetup().metadata.forConBook.list
  );
const componentId: string = generateId(useId());
</script>
