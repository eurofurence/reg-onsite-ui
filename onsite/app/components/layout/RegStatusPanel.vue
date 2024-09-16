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
import type { StatusValues } from "@/config/setupStatus";
import type { ModelRef } from "vue";

const modelValue: ModelRef<StatusValues | null> =
  defineModel<StatusValues | null>({
    required: true,
  });
</script>
