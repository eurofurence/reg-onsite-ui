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
import type {
  OptionalColoredIconLabeledValue,
  SearchElementProps,
  TransformedAttendeeInfo,
} from "@/types/internal";
import type { ModelRef } from "vue";
import { getLimitedOptionsFromAutoComplete } from "@/composables/sort_and_filter/getLimitedOptionsFromAutoComplete";
import { filterComponentRegistry } from "~/composables/state/filterComponentRegistry";

interface Props extends SearchElementProps {
  configItems: OptionalColoredIconLabeledValue<string>[];
  autoCompleteField?: keyof TransformedAttendeeInfo;
}
const props: Props = defineProps<Props>();
const modelValue: ModelRef<string[] | null> = defineModel<string[] | null>({
  required: true,
});
const autoCompleteDataRef: ModelRef<TransformedAttendeeInfo[] | undefined> =
  defineModel<TransformedAttendeeInfo[] | undefined>("autoCompleteData");

const componentId: string | undefined = useId();
onMounted(
  filterComponentRegistry.onMounted(componentId, props.columnDefinition, () => {
    modelValue.value = [];
  })
);
onBeforeUnmount(
  filterComponentRegistry.onBeforeUnmount(componentId, props.columnDefinition)
);
</script>

<style>
.tfheader:before {
  content: "Select all:";
  padding-right: 1.25rem;
}
</style>
