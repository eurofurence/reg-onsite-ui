<template>
  <MultiSelect
    v-model="modelValue"
    :options="props.configItems"
    optionValue="value"
    optionLabel="label"
    placeholder="Select"
  >
    <template #header>
      <div class="absolute text-nowrap top-1.5 left-12">Select all</div>
    </template>
    <template #option="slotProps">
      <Tag :value="slotProps.option.label" />
    </template>
    <template #value="slotProps">
      <div v-if="slotProps.value?.length === 1">
        <Tag :value="getLabel(slotProps.value[0])" />
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
import type { FilterElementProps } from "@/types/internal/component/table";
import type { LabeledValue } from "@/types/internal/infos";
import MultiSelect from "@/volt/MultiSelect.vue";
import Tag from "@/volt/Tag.vue";
import type { ModelRef } from "vue";

interface Props extends FilterElementProps {
  configItems: LabeledValue<string>[];
}
const props: Props = defineProps<Props>();
const modelValue: ModelRef<string[] | null> = defineModel<string[] | null>({
  required: true,
});

function getLabel(value: string): string {
  return (
    props.configItems.find((item: LabeledValue<string>) => item.value === value)
      ?.label ?? value
  );
}
</script>
