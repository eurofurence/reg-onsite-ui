<template>
  <span v-if="props.modelValue !== null" class="flex flex-wrap gap-1">
    <Tag v-for="value of props.modelValue" :key="value" :value="getLabel(value)" />
  </span>
  <Skeleton v-else />
</template>

<script setup lang="ts">
import Skeleton from "@/volt/Skeleton.vue";
import Tag from "@/volt/Tag.vue";
import type { LabeledValue } from "@/types/internal/infos";

function getLabel(value: string): string {
  return (
    props.configItems.find((item: LabeledValue<string>) => item.value === value)
      ?.label ?? value
  );
}

interface Props {
  modelValue: string[] | null;
  configItems: LabeledValue<string>[];
}
const props: Props = defineProps<Props>();
</script>
