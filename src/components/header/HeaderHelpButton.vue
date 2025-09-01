<template>
  <CustomConfirmDialog
    :ref="`confirmDialog${componentId}`"
    :shortcut-label="ShortcutScope.confirm_show_help"
    class="w-4/5"
  >
    <template #header>
      <CustomConfirmDialogHeader icon="pi pi-question-circle">
        Help
      </CustomConfirmDialogHeader>
    </template>
    <div class="flex flex-col text-2xl">
      <slot />
    </div>
    <template #accept="{ onClick }">
      <Button @click="onClick">Ok</Button>
    </template>
  </CustomConfirmDialog>
  <HeaderInteractionButton
    outlined
    class="aspect-square"
    v-tooltip.bottom="'Help'"
    @click="dialog?.showConfirmDialog"
  >
    <i class="pi pi-question-circle" />
  </HeaderInteractionButton>
</template>

<script setup lang="ts">
import CustomConfirmDialog from "@/components/dialog/CustomConfirmDialog.vue";
import CustomConfirmDialogHeader from "@/components/dialog/CustomConfirmDialogHeader.vue";
import HeaderInteractionButton from "@/components/header/HeaderInteractionButton.vue";
import { generateId } from "@/composables/generateId";
import { ShortcutScope } from "@/composables/services/keyboardService";
import Button from "@/volt/Button.vue";
import { useId, useTemplateRef } from "vue";

const componentId: string = generateId(useId());
const dialog = useTemplateRef<typeof CustomConfirmDialog>(
  `confirmDialog${componentId}`
);
</script>
