<template>
  <div class="grid grid-cols-3 gap-1 text-5xl">
    <Button
      @click="onNumber(7 as RegNumber)"
      class="aspect-square font-mono"
      outlined
    >
      <b>7</b>
    </Button>
    <Button
      @click="onNumber(8 as RegNumber)"
      class="aspect-square font-mono"
      outlined
    >
      <b>8</b>
    </Button>
    <Button
      @click="onNumber(9 as RegNumber)"
      class="aspect-square font-mono"
      outlined
    >
      <b>9</b>
    </Button>
    <Button
      @click="onNumber(4 as RegNumber)"
      class="aspect-square font-mono"
      outlined
    >
      <b>4</b>
    </Button>
    <Button
      @click="onNumber(5 as RegNumber)"
      class="aspect-square font-mono"
      outlined
    >
      <b>5</b>
    </Button>
    <Button
      @click="onNumber(6 as RegNumber)"
      class="aspect-square font-mono"
      outlined
    >
      <b>6</b>
    </Button>
    <Button
      @click="onNumber(1 as RegNumber)"
      class="aspect-square font-mono"
      outlined
    >
      <b>1</b>
    </Button>
    <Button
      @click="onNumber(2 as RegNumber)"
      class="aspect-square font-mono"
      outlined
    >
      <b>2</b>
    </Button>
    <Button
      @click="onNumber(3 as RegNumber)"
      class="aspect-square font-mono"
      outlined
    >
      <b>3</b>
    </Button>
    <Button @click="onRemove()" class="aspect-square font-mono" outlined>
      <i class="pi pi-arrow-circle-left text-4xl" />
    </Button>
    <Button
      @click="onNumber(0 as RegNumber)"
      class="aspect-square font-mono"
      outlined
    >
      <b>0</b>
    </Button>
    <Button
      @click="onSubmit()"
      class="aspect-square font-mono"
      :severity="props.severitySubmitButton"
    >
      <i class="pi pi-search text-4xl" />
    </Button>
  </div>
</template>

<script setup lang="ts">
import type { RegNumber } from "@/types/external/attsrv/attendees/attendee";
import type { ButtonSeverityValue } from "@/types/internal/primevue";
import Button from "@/volt/Button.vue";
import type { ModelRef } from "vue";

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
  const zero: RegNumber = 0 as RegNumber;
  // Zero should not replace a null value
  if (modelValue.value === null && number === zero) {
    modelValue.value = null;
    return;
  }
  // Check if new number should start a fresh input
  if (handleResetOnNextNumber(number)) {
    return;
  }
  // Add number to the end of the current number
  const oldValue: RegNumber = modelValue.value || zero;
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
