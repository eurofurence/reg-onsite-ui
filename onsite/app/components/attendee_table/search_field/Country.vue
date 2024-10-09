<template>
  <MultiSelect
    v-model="modelValue"
    @change="filterCallback()"
    :options="
      getLimitedOptionsFromAutoComplete(
        modelValue || [],
        metadataListForCountry,
        autoCompleteDataRef,
        'country'
      )
    "
    optionValue="value"
    optionLabel="label"
    placeholder="Filter by country"
    class="p-column-filter"
    :pt="{
      header: { class: 'tfheader' },
    }"
  >
    <template #option="slotProps">
      <AttendeeTableSearchFieldCountryItem
        :model-value="slotProps.option.value"
      />
    </template>
    <template #value="slotProps">
      <div v-if="slotProps.value?.length === 1">
        <AttendeeTableSearchFieldCountryItem
          :model-value="slotProps.value[0]"
        />
      </div>
      <div v-else-if="slotProps.value?.length > 1">
        {{ slotProps.value.length }} selected
      </div>
      <div v-else>
        {{ slotProps.placeholder }}
      </div>
    </template>
  </MultiSelect>
</template>

<script setup lang="ts">
import type { ModelRef } from "vue";
import {
  metadataListForCountry,
  type CountryCode,
} from "@/config/metadata/metadataForCountry";
import { getLimitedOptionsFromAutoComplete } from "@/composables/sort_and_filter/getLimitedOptionsFromAutoComplete";
import type { FilterElementProps } from "@/types/internal/component/table";
import type { TransformedAttendeeInfo } from "@/types/internal/attendee";

const props: FilterElementProps = defineProps<FilterElementProps>();
const modelValue: ModelRef<CountryCode[] | null> = defineModel<
  CountryCode[] | null
>({
  required: true,
});
const autoCompleteDataRef: ModelRef<TransformedAttendeeInfo[] | undefined> =
  defineModel<TransformedAttendeeInfo[] | undefined>("autoCompleteData");
</script>

<style>
.p-checkbox-box.tfcb {
  width: 1.5rem;
  height: 1.5rem;
}

.tfheader:before {
  content: "Select all:";
  padding-right: 1.25rem;
}
</style>
