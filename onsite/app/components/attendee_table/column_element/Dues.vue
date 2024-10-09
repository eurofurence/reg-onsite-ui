<template>
  <div v-if="props.modelValue !== null" class="flex align-items-center gap-2">
    <span :style="getDuesStyle(props.modelValue)">{{
      getDuesNote(props.modelValue)
    }}</span>
    <span :class="getDuesFlag(props.modelValue)"></span>
  </div>
  <Skeleton v-else></Skeleton>
</template>

<script setup lang="ts">
import { getDuesFlag } from "@/composables/fields/money/getDuesFlag";
import { getDuesNote } from "@/composables/fields/money/getDuesNote";
import { getDuesStyle } from "@/composables/fields/money/getDuesStyle";

interface Props {
  modelValue: number | null;
}
const props: Props = defineProps<Props>();
</script>
