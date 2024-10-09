<template>
  <div v-if="props.modelValue !== null">
    <CustomTagControl
      v-bind:modelValue="props.modelValue"
      :configItems="props.configItems"
    />
  </div>
  <Skeleton v-else></Skeleton>
</template>

<script setup lang="ts">
import type { OptionalColoredIconLabeledValue } from "@/types/internal/infos";

interface Props {
  modelValue: string | null;
  configItems: OptionalColoredIconLabeledValue<string>[];
}
const props: Props = defineProps<Props>();
</script>
