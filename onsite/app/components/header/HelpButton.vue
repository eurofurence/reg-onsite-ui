<template>
  <ConfirmDialog
    :group="dialogGroup"
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
import { getDialogBreakPoints } from "@/config/theme";
import type { ConfirmServiceMethods } from "@/types/external";
import { useConfirm } from "primevue/useconfirm";
import { keyboardService, ShortcutScope } from "@/composables/services/keyboardService";

const confirm: ConfirmServiceMethods = useConfirm();

function showHelp(): void {
  keyboardService.pushScope(ShortcutScope.confirmHelp);
  confirm.require({
    group: dialogGroup,
    header: "Help",
    acceptLabel: "Ok",
    rejectClass: "hidden",
    icon: "pi pi-question-circle",
  });
  keyboardService.popScope(ShortcutScope.confirmHelp);
}

const componentId: string = generateId(useId());
const dialogGroup: string = `helpDialog${componentId}`;
</script>
