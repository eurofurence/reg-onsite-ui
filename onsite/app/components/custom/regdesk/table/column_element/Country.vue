<template>
  <div
    v-if="props.modelValue.country !== null"
    class="flex align-items-center gap-2"
  >
    <span :class="getFlagCSSClass(props.modelValue.country)"></span>
    <span>{{ props.modelValue.transCountryName }}</span>
  </div>
  <Skeleton v-else />
</template>

<script setup lang="ts">
import { getFlagCSSClass } from "@/composables/fields/country/getFlagCSSClass";
import type { TransformedAttendeeInfo } from "@/types/internal";

interface Props {
  modelValue: TransformedAttendeeInfo;
}
const props: Props = defineProps<Props>();
</script>
