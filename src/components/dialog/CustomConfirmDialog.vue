<template>
  <Dialog
    v-model:visible="isVisible"
    modal
    v-bind="$attrs"
    :dismissableMask="false"
    :closeOnEscape="false"
    :closable="false"
  >
    <template #header v-if="$slots.header"> <slot name="header" /></template>
    <div class="flex flex-col gap-2">
      <div class="flex">
        <slot />
      </div>
      <div class="flex flex-row justify-end gap-2">
        <slot v-if="$slots.close" name="close" :onClick="onClose" />
        <slot v-if="$slots.accept" name="accept" :onClick="onAccept" />
      </div>
    </div>
  </Dialog>
</template>

<script setup lang="ts">
import {
  keyboardService,
  ShortcutEvent,
  ShortcutKey,
  ShortcutScope,
  type KeyboardServiceEvent,
} from "@/composables/services/keyboardService";
import Dialog from "@/volt/Dialog.vue";
import { ref, watch, type Ref } from "vue";

interface Props {
  shortcutLabel: ShortcutScope;
  willAccept?: () => boolean;
  willClose?: () => boolean;
}
const props = withDefaults(defineProps<Props>(), {
  willAccept: () => {
    return true;
  },
  willClose: () => {
    return true;
  },
});

const emit: CallableFunction = defineEmits(["onAccept", "onClose"]);

const isVisible: Ref<boolean> = ref(false);
const lastResultRef: Ref<boolean | null> = ref(null);

function onAccept() {
  if (props.willAccept && !props.willAccept()) {
    return;
  }
  lastResultRef.value = true;
  hideConfirmDialog();
  emit("onAccept");
}

function onClose() {
  if (props.willClose && !props.willClose()) {
    return;
  }
  lastResultRef.value = false;
  hideConfirmDialog();
  emit("onClose");
}

async function onEnter(event: KeyboardServiceEvent): Promise<boolean> {
  if (event.currentScope === event.registeredScope) {
    onAccept();
    return true;
  }
  return false;
}

keyboardService.registerShortcuts(
  props.shortcutLabel,
  ShortcutEvent.keydown,
  ShortcutKey.enter,
  onEnter
);

async function onEscape(event: KeyboardServiceEvent): Promise<boolean> {
  if (event.currentScope === event.registeredScope) {
    onClose();
    return true;
  }
  return false;
}

keyboardService.registerShortcuts(
  props.shortcutLabel,
  ShortcutEvent.keydown,
  ShortcutKey.escape,
  onEscape
);

function hideConfirmDialog(): void {
  isVisible.value = false;
  keyboardService.popScope(props.shortcutLabel);
}

function isAlreadyOpen(): boolean {
  return isVisible.value;
}

function showConfirmDialog(): void {
  isVisible.value = true;
  keyboardService.pushScope(props.shortcutLabel);
}

async function showConfirmDialogBlocking(): Promise<boolean> {
  lastResultRef.value = null;
  showConfirmDialog();
  await new Promise<void>((resolve) => {
    const stop = watch(isVisible, (val: boolean) => {
      if (!val) {
        stop(); // cleanup
        resolve();
      }
    });
  });
  return lastResultRef.value || false;
}
defineExpose({ showConfirmDialog, showConfirmDialogBlocking, isAlreadyOpen });
</script>
