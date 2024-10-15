<template>
  <MultiSelect
    v-model="modelValue"
    @change="props.filterCallback()"
    :options="
      getLimitedOptionsFromAutoComplete(
        modelValue || [],
        props.configItems,
        autoCompleteDataRef,
        props.autoCompleteField
      )
    "
    optionValue="value"
    optionLabel="label"
    placeholder="Select"
    class="p-tag-filter"
    :pt="{
      header: { class: 'tfheader' },
    }"
  >
    <template #option="slotProps">
      <CustomTagControl
        :modelValue="slotProps.option.value"
        :configItems="configItems"
      />
    </template>
    <template #value="slotProps">
      <div v-if="slotProps.value?.length === 1">
        <CustomTagControl
          :modelValue="slotProps.value[0]"
          :configItems="configItems"
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
import { getLimitedOptionsFromAutoComplete } from "@/composables/sort_and_filter/getLimitedOptionsFromAutoComplete";
import type { FilterElementProps } from "@/types/internal/component/table";
import type { OptionalColoredIconLabeledValue } from "@/types/internal/infos";
import type { TransformedAttendeeInfo } from "@/types/internal/attendee";

interface Props extends FilterElementProps {
  configItems: OptionalColoredIconLabeledValue<string>[];
  autoCompleteField?: keyof TransformedAttendeeInfo;
}
const props: Props = defineProps<Props>();
const modelValue: ModelRef<string[] | null> = defineModel<string[] | null>({
  required: true,
});
const autoCompleteDataRef: ModelRef<TransformedAttendeeInfo[] | undefined> =
  defineModel<TransformedAttendeeInfo[] | undefined>("autoCompleteData");
</script>

<style lang="css">
.tfheader:before {
  content: "Select all:";
  padding-right: 1.25rem;
}
</style>
