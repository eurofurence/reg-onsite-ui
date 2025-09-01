<template>
  <MultiSelect
    v-model="modelValue"
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
  >
    <template #header>
      <div class="absolute text-nowrap top-1.5 left-12">Select all</div>
    </template>
    <template #option="slotProps">
      <TagControl
        :modelValue="slotProps.option.value"
        :configItems="configItems"
      />
    </template>
    <template #value="slotProps">
      <div v-if="slotProps.value?.length === 1">
        <TagControl
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
import TagControl from "@/components/common/TagControl.vue";
import { getLimitedOptionsFromAutoComplete } from "@/composables/sort_and_filter/getLimitedOptionsFromAutoComplete";
import type { TransformedAttendeeInfo } from "@/types/internal/attendee";
import type { FilterElementProps } from "@/types/internal/component/table";
import type { OptionalColoredIconLabeledValue } from "@/types/internal/infos";
import MultiSelect from "@/volt/MultiSelect.vue";
import type { ModelRef } from "vue";

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
