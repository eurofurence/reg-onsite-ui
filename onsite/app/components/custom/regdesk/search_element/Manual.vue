<template>
  <div v-if="dataOptionsRef.queryMode === AttendeeQueryStrategy.manual">
    <Button
      icon="pi pi-search"
      v-tooltip.bottom="'Search for attendee'"
      @click="$emit('doLoad', $event)"
      :disabled="!hasMinimalFilter(dataOptionsRef.filters)"
    />
  </div>
</template>

<script setup lang="ts">
import type { ModelRef } from "vue";
import { hasMinimalFilter } from "@/composables/sort_and_filter/hasMinimalFilter";
import {
  AttendeeQueryStrategy,
  type AttendeeDataOptions,
} from "@/types/internal";

const dataOptionsRef: ModelRef<AttendeeDataOptions> =
  defineModel<AttendeeDataOptions>({ required: true });
defineEmits(["doLoad"]);
</script>
