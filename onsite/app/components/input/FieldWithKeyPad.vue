<template>
  <div class="flex-auto pt-3 pb-1 keypad-input-field">
    <InputGroup>
      <InputGroupAddon>
        <i class="pi pi-user"></i>
      </InputGroupAddon>
      <FloatLabel>
        <InputNumber
          :inputId="inputElementId"
          v-model="modelValue"
          @value="onNumberSubmit"
          :useGrouping="false"
          :min="0"
          :max="maxNumber"
          :variant="resetOnNextNumber ? 'filled' : 'outlined'"
          pt:pc-input:root:autofocus="true"
          pt:pc-input:root:class="keypad-input-number-field"
        />
        <label :for="inputElementId">Registration Number</label>
      </FloatLabel>
      <span class="p-float-label"> </span>
    </InputGroup>
  </div>
  <div>
    <InputKeyPad
      v-model="modelValue"
      v-model:resetOnNextNumber="resetOnNextNumber"
      @numberSubmit="onNumberSubmit"
      :max="maxNumber"
      :severityOK="props.severityOK === null ? undefined : props.severityOK"
    />
  </div>
</template>

<script setup lang="ts">
import {
  ShortcutEvent,
  ShortcutKey,
  ShortcutScope,
  keyboardService,
} from "@/composables/services/keyboardService";
import type { ModelRef } from "vue";
import type { SeverityValue } from "@/types/internal";

var resetOnNextNumber: Ref<boolean> = ref<boolean>(true);

function getInputElement(): HTMLInputElement {
  const inputElement: HTMLElement | null =
    document.getElementById(inputElementId);
  if (inputElement === null) {
    throw new Error("Input element not found!");
  }
  return <HTMLInputElement>inputElement;
}

async function focusRegNumberInputAndHandleReset(): Promise<void> {
  if (resetOnNextNumber.value) {
    resetOnNextNumber.value = false;
    modelValue.value = null;
  }
  await focusRegNumberInput();
}

async function focusRegNumberInput(): Promise<void> {
  const inputElement: HTMLInputElement = getInputElement();
  inputElement.focus();
  inputElement.setSelectionRange(
    inputElement.value.length,
    inputElement.value.length
  );
}

async function resetRegNumber(): Promise<void> {
  getInputElement().blur();
  modelValue.value = null;
  emit("numberSubmit", modelValue.value);
}

async function onNumberSubmit(): Promise<void> {
  resetOnNextNumber.value = true;
  getInputElement().blur();
  const number: number | null =
    Number.parseInt(getInputElement().value) || null;
  emit("numberSubmit", number);
}

keyboardService.registerShortcuts(
  ShortcutScope.keypad,
  ShortcutEvent.keydown,
  ShortcutKey.enter,
  focusRegNumberInput
);
keyboardService.registerShortcuts(
  ShortcutScope.keypad,
  ShortcutEvent.keyup,
  ShortcutKey.enter,
  onNumberSubmit
);
keyboardService.registerShortcuts(
  ShortcutScope.keypad,
  ShortcutEvent.keydown,
  ShortcutKey.backspace,
  focusRegNumberInputAndHandleReset
);
keyboardService.registerShortcuts(
  ShortcutScope.keypad,
  ShortcutEvent.keydown,
  ShortcutKey.escape,
  resetRegNumber
);
keyboardService.registerShortcuts(
  ShortcutScope.keypad,
  ShortcutEvent.keydown,
  ShortcutKey.number,
  focusRegNumberInputAndHandleReset
);

interface Props {
  maxNumber: number;
  severityOK: SeverityValue | null;
}
const props: Props = withDefaults(defineProps<Props>(), { severityOK: null });
const modelValue: ModelRef<number | null> = defineModel<number | null>({
  required: true,
});
const emit: CallableFunction = defineEmits(["numberSubmit"]);
const componentId: string = generateId(useId());
const inputElementId: string = `inputElement${componentId}`;
</script>

<style>
.keypad-input-field i {
  font-size: 2.5rem;
  padding-left: 1rem;
  padding-right: 1rem;
}

.keypad-input-field .keypad-input-number-field {
  font-size: 2.5rem;
  font-weight: bold;
  font-family: monospace;
  text-align: right;
}
</style>
