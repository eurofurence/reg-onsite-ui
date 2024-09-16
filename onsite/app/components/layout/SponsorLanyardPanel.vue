<template>
  <Panel
    v-bind="$attrs"
    :pt:header:style="getSponsorLanyardStyle(transformedAttendeeInfo)"
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
import type { ModelRef } from "vue";
import type { TransformedAttendeeInfo } from "@/types/internal";

const transformedAttendeeInfo: ModelRef<TransformedAttendeeInfo | null> =
  defineModel<TransformedAttendeeInfo | null>({
    required: true,
  });
</script>
