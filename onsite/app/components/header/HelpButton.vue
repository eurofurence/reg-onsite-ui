<template>
  <ConfirmDialog
    :group="confirmService.confirmGroup"
    :breakpoints="getDialogBreakPoints()"
    pt:pcRejectButton:root:style:display="none"
  >
    <template #message>
      <slot></slot>
    </template>
  </ConfirmDialog>
  <HeaderInteractionButton
    outlined
    class="help-button"
    icon="pi pi-question-circle"
    v-tooltip.bottom="'Help'"
    @click="showHelp"
  />
</template>

<script setup lang="ts">
import { getDialogBreakPoints } from "@/config/theme/common";
import { OnsiteConfirmService } from "@/composables/services/confirmService";
import { ShortcutScope } from "@/composables/services/keyboardService";

function showHelp(): void {
  confirmService.require(ShortcutScope.confirm_show_help, {
    header: "Help",
    acceptLabel: "Ok",
    rejectClass: "hidden",
    icon: "pi pi-question-circle",
  });
}

const componentId: string = generateId(useId());
const confirmService: OnsiteConfirmService = new OnsiteConfirmService(
  componentId
);
</script>
