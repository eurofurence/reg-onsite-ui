<template>
  <div class="keypad gap-1">
    <Button @click="onNumber(7)" label="7" outlined></Button>
    <Button @click="onNumber(8)" label="8" outlined></Button>
    <Button @click="onNumber(9)" label="9" outlined></Button>
    <Button @click="onNumber(4)" label="4" outlined></Button>
    <Button @click="onNumber(5)" label="5" outlined></Button>
    <Button @click="onNumber(6)" label="6" outlined></Button>
    <Button @click="onNumber(1)" label="1" outlined></Button>
    <Button @click="onNumber(2)" label="2" outlined></Button>
    <Button @click="onNumber(3)" label="3" outlined></Button>
    <Button
      @click="onRemove()"
      icon="pi pi-arrow-circle-left"
      outlined
    ></Button>
    <Button @click="onNumber(0)" label="0" outlined></Button>
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

function onSubmit(): void {
  resetOnNextNumber.value = true;
  emit("numberSubmit", modelValue.value);
}

function handleResetOnNextNumber(number: number | null): boolean {
  if (resetOnNextNumber.value) {
    resetOnNextNumber.value = false;
    modelValue.value = number;
    return true;
  }
  return false;
}

function onNumber(number: number): void {
  if (handleResetOnNextNumber(number)) {
    return;
  }
  const oldValue: number = modelValue.value || 0;
  const newValue: number = oldValue * 10 + number;
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
    modelValue.value = newValue;
  }
}

interface Props {
  max: number;
  severitySubmitButton?: ButtonSeverityValue;
}
const props: Props = defineProps<Props>();
const modelValue: ModelRef<number | null> = defineModel<number | null>({
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

<style>
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
