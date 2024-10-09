<template>
  <div v-if="props.modelValue.transCanCheckin !== null">
    <Button
      label="Checkin"
      class="h-8 w-28"
      v-tooltip.left="getTooltip()"
      :disabled="!props.modelValue.transCanCheckin"
      @click="$emit('onCheckin', props.modelValue.id)"
    />
  </div>
  <Skeleton class="h-8 w-28" v-else></Skeleton>
</template>

<script setup lang="ts">
import type { TransformedAttendeeInfo } from "@/types/internal/attendee";

function getTooltip(): string | undefined {
  if (!props.modelValue.transCanCheckin) {
    return "Attendee can't be checked in!";
  }
  return undefined;
}

interface Props {
  modelValue: TransformedAttendeeInfo;
}
const props: Props = defineProps<Props>();
defineEmits(["onCheckin"]);
</script>
