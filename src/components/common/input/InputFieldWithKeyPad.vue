<template>
  <div class="flex flex-col flex-grow gap-1">
    <label :for="inputElementId" class="text-xs">Registration Number</label>
    <div class="flex flex-grow w-full">
      <span
        class="text-3xl min-w-15 aspect-square flex items-center justify-center border-y border-s border-surface-300 dark:border-surface-700 bg-surface-0 dark:bg-surface-950 text-surface-400 rounded-s-md"
      >
        <i class="pi pi-user" />
      </span>
      <InputNumber
        :inputId="inputElementId"
        v-model="modelValue"
        @value="onNumberSubmit"
        :useGrouping="false"
        :min="1"
        :max="maxNumber"
        :variant="resetOnNextNumber ? 'filled' : 'outlined'"
        class="flex-grow"
        inputClass="text-4xl font-bold font-mono text-right min-w-32 max-w-full w-full rounded-s-none rounded-e-md"
        pt:pcInputText:autofocus="true"
      />
    </div>
    <KeyPad
      v-model="modelValue"
      v-model:resetOnNextNumber="resetOnNextNumber"
      @numberSubmit="onNumberSubmit"
      :max="maxNumber"
      :severitySubmitButton="getSubmitButtonSeverity()"
    />
  </div>
</template>

<script setup lang="ts">
import KeyPad from "@/components/common/input/KeyPad.vue";
import { generateId } from "@/composables/generateId";
import { getInputElement } from "@/composables/getInputElement";
import {
  ShortcutEvent,
  ShortcutKey,
  ShortcutScope,
  keyboardService,
  type KeyboardServiceEvent,
} from "@/composables/services/keyboardService";
import type { RegNumber } from "@/types/external/attsrv/attendees/attendee";
import type { ButtonSeverityValue } from "@/types/internal/primevue";
import InputNumber from "@/volt/InputNumber.vue";
import type { ModelRef } from "vue";
import { ref, useId, type Ref } from "vue";

var resetOnNextNumber: Ref<boolean> = ref<boolean>(false);

function getSubmitButtonSeverity(): ButtonSeverityValue | undefined {
  if (props.severitySubmitButton === null) {
    return undefined;
  }
  return props.severitySubmitButton;
}

async function focusRegNumberInputAndHandleReset(): Promise<void> {
  if (resetOnNextNumber.value) {
    resetOnNextNumber.value = false;
    modelValue.value = null;
  }
  await focusRegNumberInput();
}

async function focusRegNumberInput(): Promise<void> {
  const inputElement: HTMLInputElement = getInputElement(inputElementId);
  inputElement.focus();
  // Position cursor at the end of the input
  inputElement.setSelectionRange(
    inputElement.value.length,
    inputElement.value.length
  );
}

async function resetRegNumber(): Promise<void> {
  const inputElement: HTMLInputElement = getInputElement(inputElementId);
  resetOnNextNumber.value = true;
  inputElement.value = "";
  inputElement.blur();
  modelValue.value = null;
  emit("numberSubmit", null);
}

async function onNumberSubmit(): Promise<void> {
  resetOnNextNumber.value = true;
  const inputElement: HTMLInputElement = getInputElement(inputElementId);
  inputElement.blur();
  const number: RegNumber | null =
    (Number.parseInt(inputElement.value) as RegNumber) || null;
  emit("numberSubmit", number);
}

function isShortcutActive(event: KeyboardServiceEvent): boolean {
  return (
    props.shortcutScopes.includes(event.currentScope) ||
    event.currentScope === event.registeredScope
  );
}

keyboardService.registerShortcuts(
  ShortcutScope.keypad,
  ShortcutEvent.keydown,
  ShortcutKey.enter,
  async (event: KeyboardServiceEvent) => {
    if (isShortcutActive(event)) {
      await focusRegNumberInput();
      return true;
    }
    return false;
  }
);
keyboardService.registerShortcuts(
  ShortcutScope.keypad,
  ShortcutEvent.keyup,
  ShortcutKey.enter,
  async (event: KeyboardServiceEvent) => {
    if (isShortcutActive(event)) {
      await onNumberSubmit();
      return true;
    }
    return false;
  }
);
keyboardService.registerShortcuts(
  ShortcutScope.keypad,
  ShortcutEvent.keydown,
  ShortcutKey.escape,
  async (event: KeyboardServiceEvent) => {
    if (isShortcutActive(event)) {
      await resetRegNumber();
      return true;
    }
    return false;
  }
);
keyboardService.registerShortcuts(
  ShortcutScope.keypad,
  ShortcutEvent.keydown,
  ShortcutKey.backspace,
  async (event: KeyboardServiceEvent) => {
    if (isShortcutActive(event)) {
      await focusRegNumberInputAndHandleReset();
      return false; // this is correct!
    }
    return false;
  }
);
keyboardService.registerShortcuts(
  ShortcutScope.keypad,
  ShortcutEvent.keydown,
  ShortcutKey.number,
  async (event: KeyboardServiceEvent) => {
    if (isShortcutActive(event)) {
      await focusRegNumberInputAndHandleReset();
      return false; // this is correct!
    }
    return false;
  }
);

interface Props {
  maxNumber: RegNumber;
  shortcutScopes: ShortcutScope[];
  severitySubmitButton: ButtonSeverityValue | null;
}
const props = withDefaults(defineProps<Props>(), {
  severitySubmitButton: null,
});
const modelValue: ModelRef<RegNumber | null> = defineModel<RegNumber | null>({
  required: true,
});
const emit: CallableFunction = defineEmits(["numberSubmit"]);
const componentId: string = generateId(useId());
const inputElementId: string = `inputElement${componentId}`;
</script>
