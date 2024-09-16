<template>
  <div :class="fieldCSS">
    <label :for="componentId" :class="fieldLabelCSS">Pronouns</label>
    <InputText
      :id="componentId"
      :class="getPronounFieldTextCSS(modelValue)"
      v-model="modelValue"
      v-bind="$attrs"
      v-if="modelValue"
    />
    <FieldPlaceholder width="12rem" :labelId="componentId" v-else />
  </div>
</template>

<script setup lang="ts">
import {
  fieldCSS,
  fieldLabelCSS,
  fieldTextCSS,
} from "@/components/field/common";
import type { ModelRef } from "vue";

function getPronounFieldTextCSS(value: string | undefined) {
  if (value === undefined || value.length > 10) {
    return fieldTextCSS;
  }
  return `${fieldTextCSS} w-32`;
}

const modelValue: ModelRef<string | null | undefined> = defineModel<
  string | null | undefined
>({ required: true });
const componentId: string = generateId(useId());
</script>
