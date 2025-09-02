<template>
  <CustomConfirmDialog
    :ref="`confirmIfDirtyDialog${componentId}`"
    :shortcutLabel="ShortcutScope.confirm_if_dirty"
    class="w-4/5"
  >
    <template #header>
      <CustomConfirmDialogHeader icon="pi pi-exclamation-triangle">
        Confirmation
      </CustomConfirmDialogHeader>
    </template>
    <div class="flex flex-col">
      There are unsaved changes! Are you sure you want to proceed?
    </div>
    <template #accept="{ onClick }">
      <Button @click="onClick">Confirm</Button>
    </template>
    <template #close="{ onClick }">
      <Button outlined @click="onClick">Abort</Button>
    </template>
  </CustomConfirmDialog>

  <div class="flex flex-col h-screen w-full">
    <div class="p-px w-full">
      <HeaderLoginPanel :title="props.title" :theming="props.theming">
        <template #help v-if="$slots.help">
          <slot name="help"></slot>
        </template>
      </HeaderLoginPanel>
    </div>
    <div
      class="pt-1 flex flex-grow w-full"
      v-if="authState.sessionActive"
    >
      <slot></slot>
    </div>
    <div class="p-px w-full">
      <Debug />
    </div>
  </div>
</template>

<script setup lang="ts">
import Debug from "@/components/common/Debug.vue";
import CustomConfirmDialog from "@/components/dialog/CustomConfirmDialog.vue";
import CustomConfirmDialogHeader from "@/components/dialog/CustomConfirmDialogHeader.vue";
import HeaderLoginPanel from "@/components/header/HeaderLoginPanel.vue";
import { registerIsDirtyDialog } from "@/composables/dirty/confirmIfDirty";
import { generateId } from "@/composables/generateId";
import { ShortcutScope } from "@/composables/services/keyboardService";
import { authState } from "@/composables/state/authState";
import { initTheme, themeSettings } from "@/composables/theme/initTheme";
import Button from "@/volt/Button.vue";
import { onMounted, useId, useTemplateRef, watch, type ShallowRef } from "vue";

interface Props {
  title: string;
  theming?: boolean;
}
const props = withDefaults(defineProps<Props>(), {
  theming: true,
});

const componentId: string = generateId(useId());
const customIsDirtyDialog: ShallowRef<typeof CustomConfirmDialog | null> =
  useTemplateRef<typeof CustomConfirmDialog>(
    `confirmIfDirtyDialog${componentId}`
  );

watch(themeSettings, initTheme, { immediate: true, deep: true });

onMounted(() => {
  document.title = props.title;

  if (customIsDirtyDialog.value !== null) {
    registerIsDirtyDialog(customIsDirtyDialog.value);
  }
});
</script>
