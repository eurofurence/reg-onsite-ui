<template>
  <Panel
    v-bind="$attrs"
    :pt:header:style="getSponsorLanyardStyle(transformedAttendeeInfo)"
    :pt:header:class="
      isDarkMode
        ? `bg-gradient-to-r from-gray-800 to-gray-700 h-14 pr-1.5`
        : `bg-gradient-to-r from-gray-300 to-gray-200 h-14 pr-1.5`
    "
  >
    <template #header v-if="$slots.header">
      <slot name="header"></slot>
    </template>
    <template #icons v-if="$slots.icons">
      <slot name="icons"></slot>
    </template>
    <template #footer v-if="$slots.footer">
      <slot name="footer"></slot>
    </template>
    <slot></slot>
  </Panel>
</template>

<script setup lang="ts">
import { getSponsorLanyardStyle } from "@/composables/colors/getSponsorLanyardStyle";
import { isDarkMode } from "@/composables/theme/isDarkMode";
import type { TransformedAttendeeInfo } from "@/types/internal/attendee";
import Panel from "@/volt/Panel.vue";
import type { ModelRef } from "vue";

const transformedAttendeeInfo: ModelRef<TransformedAttendeeInfo | null> =
  defineModel<TransformedAttendeeInfo | null>({
    required: true,
  });
</script>
