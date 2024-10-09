<template>
  <Panel v-bind="$attrs" :pt:header:style="getStatusStyle(modelValue)">
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
import { getStatusStyle } from "@/composables/fields/status/getStatusStyle";
import type { ModelRef } from "vue";
import type { AttendeeApiStatusValues } from "@/config/metadata/metadataForStatus";

const modelValue: ModelRef<AttendeeApiStatusValues | null> =
  defineModel<AttendeeApiStatusValues | null>({
    required: true,
  });
</script>
