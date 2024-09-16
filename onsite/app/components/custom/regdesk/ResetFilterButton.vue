<template>
  <Button
    icon="pi pi-filter-slash"
    v-tooltip.right="'Reset search (implicit filters will be unchanged)'"
    @click="doResetFilters"
    :disabled="filterIsPristine()"
  />
</template>

<script setup lang="ts">
import { defaultAttendeeDataOptions } from "@/config/regdesk";
import type { ModelRef } from "vue";
import type { AttendeeDataOptions } from "@/types/internal";

const referenceFilterStr: string = JSON.stringify(
  defaultAttendeeDataOptions.filters
);

function filterIsPristine() {
  return referenceFilterStr === JSON.stringify(dataOptionsRef.value.filters);
}

function doResetFilters() {
  dataOptionsRef.value.filters = JSON.parse(referenceFilterStr);
}

const dataOptionsRef: ModelRef<AttendeeDataOptions> =
  defineModel<AttendeeDataOptions>({ required: true });
</script>
