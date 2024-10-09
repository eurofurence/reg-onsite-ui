<template>
  <FieldCommonLabeledInputText
    v-model="modelValue"
    :widthInRem="12"
    label="Zip Code"
  />
</template>

<script setup lang="ts">
import type { ModelRef } from "vue";

const modelValue: ModelRef<string | null> = defineModel<string | null>({
  required: true,
});
</script>
