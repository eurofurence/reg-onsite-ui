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
      :severitySubmitButton="
        props.severitySubmitButton === null
          ? undefined
          : props.severitySubmitButton
      "
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
import { getInputElement } from "@/composables/getInputElement";
import type { ButtonSeverityValue } from "@/types/internal/primevue";
import type { RegNumber } from "@/types/external/attsrv/attendees/attendee";

var resetOnNextNumber: Ref<boolean> = ref<boolean>(true);

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
  getInputElement(inputElementId).blur();
  modelValue.value = null;
  emit("numberSubmit", modelValue.value);
}

async function onNumberSubmit(): Promise<void> {
  resetOnNextNumber.value = true;
  getInputElement(inputElementId).blur();
  const number: RegNumber | null =
    (Number.parseInt(getInputElement(inputElementId).value) as RegNumber) ||
    null;
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
  maxNumber: RegNumber;
  severitySubmitButton: ButtonSeverityValue | null;
}
const props: Props = withDefaults(defineProps<Props>(), {
  severitySubmitButton: null,
});
const modelValue: ModelRef<RegNumber | null> = defineModel<RegNumber | null>({
  required: true,
});
const emit: CallableFunction = defineEmits(["numberSubmit"]);
const componentId: string = generateId(useId());
const inputElementId: string = `inputElement${componentId}`;
</script>

<style lang="css">
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
