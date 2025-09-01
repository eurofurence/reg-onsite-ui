<template>
  <LabeledInputText
    v-model="modelValue"
    :widthInRem="6"
    label="Badge ID"
    class="text-right"
  />
</template>

<script setup lang="ts">
import LabeledInputText from "@/components/common/field/common/LabeledInputText.vue";
import type { ModelRef } from "vue";
const modelValue: ModelRef<string | null> = defineModel<string | null>({
  required: true,
});
</script>
