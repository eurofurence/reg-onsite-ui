<template>
  <InputText
    v-model="modelValue"
    placeholder="yyyy-mm-dd"
    maxlength="10"
    @keypress="onKeyPress"
    @paste="onPaste"
  />
</template>

<script setup lang="ts">
import InputText from "@/volt/InputText.vue";
import type { ModelRef } from "vue";

const modelValue: ModelRef<string | null> = defineModel<string | null>({
  required: true,
});

function onKeyPress(event: KeyboardEvent): void {
  if (!/^[0-9-]$/.test(event.key)) {
    event.preventDefault();
  }
}

function onPaste(event: ClipboardEvent): void {
  event.preventDefault();
  const pastedText: string = event.clipboardData?.getData("text") || "";
  const sanitizedText: string = pastedText.replace(/[^0-9-]/g, "");
  const target: HTMLInputElement = event.target as HTMLInputElement;
  const start: number = target.selectionStart ?? target.value.length;
  const end: number = target.selectionEnd ?? target.value.length;
  const newValue: string = (
    target.value.slice(0, start) +
    sanitizedText +
    target.value.slice(end)
  ).slice(0, 10);
  modelValue.value = newValue;
}
</script>
