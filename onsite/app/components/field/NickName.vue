<template>
  <div :class="fieldCSS" class="w-48">
    <label :for="componentId" :class="fieldLabelCSS">Nickname</label>
    <InputText
      :id="componentId"
      :class="fieldTextCSS"
      v-model="modelValue"
      v-bind="$attrs"
      v-if="modelValue"
    />
    <FieldPlaceholder :labelId="componentId" v-else />
  </div>
</template>

<script setup lang="ts">
import {
  fieldCSS,
  fieldLabelCSS,
  fieldTextCSS,
} from "@/components/field/common";
import type { ModelRef } from "vue";

const modelValue: ModelRef<string | null> = defineModel<string | null>({
  required: true,
});
const componentId: string = generateId(useId());
</script>
