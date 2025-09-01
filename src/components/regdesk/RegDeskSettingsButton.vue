<template>
  <Dialog
    header="Regdesk Settings"
    v-model:visible="dialogVisibleForSettingsRef"
  >
    <RegDeskOptions
      v-model:displayOptions="displayOptionsRef"
      v-model:dataOptions="dataOptionsRef"
    />
  </Dialog>

  <Button
    class="h-12 aspect-square"
    @click="dialogVisibleForSettingsRef = true"
    outlined
    v-tooltip.bottom="'Search options'"
  >
    <i class="pi pi-cog" />
  </Button>
</template>

<script setup lang="ts">
import RegDeskOptions from "@/components/regdesk/RegDeskOptions.vue";
import {
  ShortcutScope,
  watchDialogVisibility,
} from "@/composables/services/keyboardService";
import type {
  AttendeeDataOptions,
  AttendeeTableDisplayOptions,
} from "@/types/internal/system/regdesk";
import Button from "@/volt/Button.vue";
import Dialog from "@/volt/Dialog.vue";
import { type ModelRef, ref, type Ref } from "vue";

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
