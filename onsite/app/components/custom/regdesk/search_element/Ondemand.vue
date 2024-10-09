<template>
  <div v-if="dataOptionsRef.queryMode === AttendeeQueryStrategy.ondemand">
    <Button
      outlined
      icon="pi pi-refresh"
      v-tooltip.bottom="'Refresh search results'"
      @click="$emit('doLoad', $event)"
    />
  </div>
</template>

<script setup lang="ts">
import type { ModelRef } from "vue";
import {
  AttendeeQueryStrategy,
  type AttendeeDataOptions,
} from "@/types/internal/system/regdesk";

const dataOptionsRef: ModelRef<AttendeeDataOptions> =
  defineModel<AttendeeDataOptions>({ required: true });
defineEmits(["doLoad"]);
</script>
