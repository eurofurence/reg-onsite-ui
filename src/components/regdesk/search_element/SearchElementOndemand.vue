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
import {
  AttendeeQueryStrategy,
  type AttendeeDataOptions,
} from "@/types/internal/system/regdesk";
import Button from "@/volt/Button.vue";
import type { ModelRef } from "vue";

const dataOptionsRef: ModelRef<AttendeeDataOptions> =
  defineModel<AttendeeDataOptions>({ required: true });
defineEmits(["doLoad"]);
</script>
