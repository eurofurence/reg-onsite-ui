<template>
  <div v-if="props.modelValue !== null">
    <TagControl
      v-bind:modelValue="props.modelValue"
      :configItems="props.configItems"
    />
  </div>
  <Skeleton v-else></Skeleton>
</template>

<script setup lang="ts">
import TagControl from "@/components/common/TagControl.vue";
import type { OptionalColoredIconLabeledValue } from "@/types/internal/infos";
import Skeleton from "@/volt/Skeleton.vue";

interface Props {
  modelValue: string | null;
  configItems: OptionalColoredIconLabeledValue<string>[];
}
const props: Props = defineProps<Props>();
</script>
