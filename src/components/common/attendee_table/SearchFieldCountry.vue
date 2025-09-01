<template>
  <MultiSelect
    v-model="modelValue"
    :options="
      getLimitedOptionsFromAutoComplete(
        modelValue || [],
        getConventionSetup().metadata.forCountry.list,
        autoCompleteDataRef,
        'country'
      )
    "
    optionValue="value"
    optionLabel="label"
    placeholder="Filter by country"
  >
    <template #header>
      <div class="absolute text-nowrap top-1.5 left-12">Select all</div>
    </template>
    <template #option="slotProps">
      <SearchFieldCountryItem :model-value="slotProps.option.value" />
    </template>
    <template #value="slotProps">
      <div v-if="slotProps.value?.length === 1">
        <SearchFieldCountryItem :model-value="slotProps.value[0]" />
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
import SearchFieldCountryItem from "@/components/common/attendee_table/SearchFieldCountryItem.vue";
import { getConventionSetup } from "@/composables/logic/getConventionSetup";
import { getLimitedOptionsFromAutoComplete } from "@/composables/sort_and_filter/getLimitedOptionsFromAutoComplete";
import { type CountryCode } from "@/config/metadata/metadataForCountry";
import type { TransformedAttendeeInfo } from "@/types/internal/attendee";
import MultiSelect from "@/volt/MultiSelect.vue";
import type { ModelRef } from "vue";

const modelValue: ModelRef<CountryCode[] | null> = defineModel<
  CountryCode[] | null
>({
  required: true,
});
const autoCompleteDataRef: ModelRef<TransformedAttendeeInfo[] | undefined> =
  defineModel<TransformedAttendeeInfo[] | undefined>("autoCompleteData");
</script>
