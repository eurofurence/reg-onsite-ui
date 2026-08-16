<template>
  <Button
    icon="pi pi-filter-slash"
    label="Reset"
    severity="secondary"
    v-tooltip.right="'Reset search (implicit filters will be unchanged)'"
    @click="onResetFilters()"
    :disabled="isDisabled()"
  />
</template>

<script setup lang="ts">
import { doResetFilters } from "@/composables/filter/doResetFilters";
import { isFilterPristine } from "@/composables/filter/isFilterPristine";
import type { AttendeeDataOptions } from "@/types/internal/system/regdesk";
import Button from "@/volt/Button.vue";
import type { ModelRef } from "vue";

function onResetFilters() {
  doResetFilters(dataOptionsRef);
}

function isDisabled() {
  return isFilterPristine(dataOptionsRef);
}

const dataOptionsRef: ModelRef<AttendeeDataOptions> =
  defineModel<AttendeeDataOptions>({ required: true });
</script>
