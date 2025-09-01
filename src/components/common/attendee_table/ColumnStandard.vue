<template>
  <span
    v-if="props.modelValue !== null"
    v-tooltip.right="getTooltip(props.modelValue)"
    >{{ truncateString(props.modelValue) }}</span
  >
  <Skeleton v-else />
</template>

<script setup lang="ts">
import Skeleton from "@/volt/Skeleton.vue";

function getTooltip(value: string): string {
  if (value.length > props.maxLength) {
    return value;
  }
  return "";
}

function truncateString(value: string): string {
  if (value.length > props.maxLength) {
    return value.substring(0, props.maxLength) + "...";
  }
  return value;
}

interface Props {
  modelValue: string | null;
  maxLength: number;
}
const props: Props = defineProps<Props>();
</script>
