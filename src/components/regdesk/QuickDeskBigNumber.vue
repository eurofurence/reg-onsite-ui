<template>
  <div
    class="flex flex-grow justify-center items-center"
    :style="{ 'font-size': `${props.size}rem` }"
    v-if="props.attendee?.id != null"
  >
    #{{ props.attendee.id }}
  </div>
</template>

<script setup lang="ts">
import type { TransformedAttendeeInfo } from "@/types/internal/attendee";
import type { FontSize } from "@/types/internal/system/theme";

interface Props {
  attendee: TransformedAttendeeInfo | null;
  size: FontSize;
}
const props: Props = defineProps<Props>();
</script>
