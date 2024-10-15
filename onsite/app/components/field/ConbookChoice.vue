<template>
  <div :class="fieldCSS">
    <label :for="componentId" :class="fieldLabelCSS">Conbook</label>
    <SelectButton
      :id="componentId"
      :class="fieldTextCSS"
      v-model="conbookChoice"
      :pt:pc-toggle-button:root="getButtonStyle"
      :options="getConventionSetup().metadata.forConBook.list"
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
} from "@/components/field/common/common";
import { computeFlagsChoice } from "@/composables/fields/flags/computeFlagsChoice";
import { getSelectedButtonStyle } from "@/composables/fields/flags/getSelectedButtonStyle";
import {
  type ConBookApiValue,
  type ConBookValue,
} from "@/config/metadata/flags/metadataForConBookChoice";
import type { FlagApiValue } from "@/types/external/attsrv/attendees/attendee";
import type { SelectButtonPassThroughMethodOptions } from "primevue/selectbutton";
import type { ModelRef } from "vue";
import type { WritableComputedRef } from "vue";
import { getConventionSetup } from "@/composables/logic/getConventionSetup";

function getButtonStyle(options: SelectButtonPassThroughMethodOptions) {
  return getSelectedButtonStyle(
    conbookChoice,
    getConventionSetup().metadata.forConBook.list,
    options
  );
}

const modelValue: ModelRef<FlagApiValue[] | null> = defineModel<
  FlagApiValue[] | null
>({
  required: true,
});
const conbookChoice: WritableComputedRef<ConBookValue | null> =
  computeFlagsChoice<FlagApiValue, ConBookApiValue>(
    modelValue,
    getConventionSetup().metadata.forConBook.list
  );
const componentId: string = generateId(useId());
</script>
