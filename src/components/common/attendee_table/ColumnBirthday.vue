<template>
  <div
    v-if="props.modelValue.birthday && props.modelValue.transAge"
    class="flex align-items-center gap-2"
  >
    <span v-tooltip.right="`${props.modelValue.transAge}`">{{
      props.modelValue.birthday
    }}</span>
    <span :class="getBirthdayFlag(props.modelValue.transAge)"></span>
  </div>
  <Skeleton v-else />
</template>

<script setup lang="ts">
import { getBirthdayFlag } from "@/composables/fields/birthday/getBirthdayFlag";
import type { TransformedAttendeeInfo } from "@/types/internal/attendee";
import Skeleton from "@/volt/Skeleton.vue";

interface Props {
  modelValue: TransformedAttendeeInfo;
}
const props: Props = defineProps<Props>();
</script>
