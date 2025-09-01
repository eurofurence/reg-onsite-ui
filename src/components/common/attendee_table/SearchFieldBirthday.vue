<template>
  <InputMask
    v-model="modelValue"
    placeholder="yyyy-mm-dd"
    mask="9999-99-99"
    slotChar="yyyy-mm-dd"
    :autoClear="false"
  />
</template>

<script setup lang="ts">
import InputMask from "@/volt/InputMask.vue";
import type { ModelRef } from "vue";

const modelValue: ModelRef<string | null> = defineModel<string | null>({
  required: true,
});
</script>
