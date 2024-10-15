<template>
  <div class="keypad gap-1">
    <Button @click="onNumber(7 as RegNumber)" label="7" outlined></Button>
    <Button @click="onNumber(8 as RegNumber)" label="8" outlined></Button>
    <Button @click="onNumber(9 as RegNumber)" label="9" outlined></Button>
    <Button @click="onNumber(4 as RegNumber)" label="4" outlined></Button>
    <Button @click="onNumber(5 as RegNumber)" label="5" outlined></Button>
    <Button @click="onNumber(6 as RegNumber)" label="6" outlined></Button>
    <Button @click="onNumber(1 as RegNumber)" label="1" outlined></Button>
    <Button @click="onNumber(2 as RegNumber)" label="2" outlined></Button>
    <Button @click="onNumber(3 as RegNumber)" label="3" outlined></Button>
    <Button
      @click="onRemove()"
      icon="pi pi-arrow-circle-left"
      outlined
    ></Button>
    <Button @click="onNumber(0 as RegNumber)" label="0" outlined></Button>
    <Button
      @click="onSubmit()"
      icon="pi pi-search"
      :severity="props.severitySubmitButton"
    />
  </div>
</template>

<script setup lang="ts">
import type { ModelRef } from "vue";
import type { ButtonSeverityValue } from "@/types/internal/primevue";
import type { RegNumber } from "@/types/external/attsrv/attendees/attendee";

function onSubmit(): void {
  resetOnNextNumber.value = true;
  emit("numberSubmit", modelValue.value);
}

function handleResetOnNextNumber(number: RegNumber | null): boolean {
  if (resetOnNextNumber.value) {
    resetOnNextNumber.value = false;
    modelValue.value = number;
    return true;
  }
  return false;
}

function onNumber(number: RegNumber): void {
  if (handleResetOnNextNumber(number)) {
    return;
  }
  const oldValue: RegNumber = modelValue.value || (0 as RegNumber);
  const newValue: RegNumber = (oldValue * 10 + number) as RegNumber;
  if (newValue <= props.max) {
    modelValue.value = newValue;
  }
}

function onRemove(): void {
  if (handleResetOnNextNumber(null)) {
    return;
  }
  if (modelValue.value === null) {
    return;
  }
  const newValue = Math.floor(modelValue.value / 10);
  if (newValue == 0) {
    modelValue.value = null;
  } else {
    modelValue.value = newValue as RegNumber;
  }
}

interface Props {
  max: RegNumber;
  severitySubmitButton?: ButtonSeverityValue;
}
const props: Props = defineProps<Props>();
const modelValue: ModelRef<RegNumber | null> = defineModel<RegNumber | null>({
  required: true,
});
const resetOnNextNumber: ModelRef<boolean> = defineModel<boolean>(
  "resetOnNextNumber",
  {
    required: true,
  }
);
const emit: CallableFunction = defineEmits(["numberSubmit"]);
</script>

<style lang="css">
.keypad {
  display: grid;
  grid-template-columns: 1fr 1fr 1fr;
}

.keypad .p-button {
  padding: 0;
  aspect-ratio: 1;
  font-size: 3rem;
  font-weight: bold;
  font-family: monospace;
}

.keypad .p-button.p-button-icon-only {
  width: auto;
}

.keypad .pi {
  font-size: 2.5rem;
}
</style>
