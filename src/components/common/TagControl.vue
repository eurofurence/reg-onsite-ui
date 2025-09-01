<template>
  <Tag
    v-if="property !== null && property !== undefined"
    :value="property.label"
    :icon="property.icon"
    :class="getCSSClass(property.value)"
    :style="{
      border: '1px var(--text-color)',
      background: resolveColorEntry(property),
      color: 'white',
    }"
  />
</template>

<script setup lang="ts">
import { resolveColorEntry } from "@/components/common/field/common/common";
import { convertObjectListWithValueToMap } from "@/composables/collection_tools/convertObjectListWithValueToMap";
import type { OptionalColoredIconLabeledValue } from "@/types/internal/infos";
import Tag from "@/volt/Tag.vue";
import { computed, type ComputedRef, type ModelRef } from "vue";

interface Props {
  configItems: OptionalColoredIconLabeledValue<string>[];
}

function getCSSClass(value: string): string {
  return `border-solid tag-value-${value}`;
}

function lookupProperty(
  value: string | null | undefined
): OptionalColoredIconLabeledValue<string> | null {
  if (value === null || value === undefined) {
    return null;
  }
  const propertyValue: OptionalColoredIconLabeledValue<string> | undefined =
    propertyMap.get(value);
  if (propertyValue === undefined) {
    return null;
  }
  return propertyValue;
}
const props: Props = defineProps<Props>();

const modelValue: ModelRef<string | null | undefined> = defineModel<
  string | null | undefined
>({
  required: true,
});

const property: ComputedRef<OptionalColoredIconLabeledValue<string> | null> =
  computed<OptionalColoredIconLabeledValue<string> | null>(() =>
    lookupProperty(modelValue.value)
  );

const propertyMap: Map<
  string,
  OptionalColoredIconLabeledValue<string>
> = convertObjectListWithValueToMap(props.configItems);
</script>
