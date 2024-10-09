<template>
  <Button
    icon="pi pi-filter-slash"
    v-tooltip.right="'Reset search (implicit filters will be unchanged)'"
    @click="onResetFilters()"
    :disabled="isDisabled()"
  />
</template>

<script setup lang="ts">
import type { ModelRef } from "vue";
import { isFilterPristine } from "@/composables/filter/isFilterPristine";
import { doResetFilters } from "@/composables/filter/doResetFilters";
import type { AttendeeDataOptions } from "@/types/internal/system/regdesk";

function onResetFilters() {
  doResetFilters(dataOptionsRef);
}

function isDisabled() {
  return isFilterPristine(dataOptionsRef);
}

const dataOptionsRef: ModelRef<AttendeeDataOptions> =
  defineModel<AttendeeDataOptions>({ required: true });
</script>
