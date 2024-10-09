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
import {
  watchDialogVisibility,
  ShortcutScope,
} from "@/composables/services/keyboardService";
import type {
  AttendeeDataOptions,
  AttendeeTableDisplayOptions,
} from "@/types/internal/system/regdesk";

const dialogVisibleForSettingsRef: Ref<boolean> = ref<boolean>(false);
watchDialogVisibility(
  dialogVisibleForSettingsRef,
  ShortcutScope.dialog_regdesk_settings
);

const displayOptionsRef: ModelRef<AttendeeTableDisplayOptions> =
  defineModel<AttendeeTableDisplayOptions>("displayOptions", {
    required: true,
  });

const dataOptionsRef: ModelRef<AttendeeDataOptions> =
  defineModel<AttendeeDataOptions>({ required: true });
</script>
