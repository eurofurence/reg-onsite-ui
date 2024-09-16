<template>
  <Dialog
    header="Regdesk Settings"
    v-model:visible="dialogVisibleForSettingsRef"
  >
    <PanelRegdeskOptions
      v-model:displayOptions="displayOptionsRef"
      v-model:dataOptions="dataOptionsRef"
    />
  </Dialog>

  <Button
    icon="pi pi-cog"
    @click="dialogVisibleForSettingsRef = true"
    outlined
    v-tooltip.bottom="'Search options'"
  />
</template>

<script setup lang="ts">
import type { ModelRef } from "vue";
import type {
  AttendeeDataOptions,
  AttendeeTableDisplayOptions,
} from "@/types/internal";

const dialogVisibleForSettingsRef: Ref<boolean> = ref<boolean>(false);

const displayOptionsRef: ModelRef<AttendeeTableDisplayOptions> =
  defineModel<AttendeeTableDisplayOptions>("displayOptions", {
    required: true,
  });

const dataOptionsRef: ModelRef<AttendeeDataOptions> =
  defineModel<AttendeeDataOptions>({ required: true });
</script>
