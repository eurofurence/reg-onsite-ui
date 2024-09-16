<template>
  <div :class="fieldCSS">
    <label :for="componentId" :class="fieldLabelCSS">Open Payments</label>
    <IconField v-if="modelValue !== null">
      <InputIcon :class="getDuesFlag(modelValue)" />
      <InputText
        v-tooltip.hover="{
          value: `${getDuesNote(modelValue)}`,
          showDelay: 0,
          hideDelay: 1000,
        }"
        :id="componentId"
        :class="getDuesFieldTextCSS(modelValue)"
        class="w-32 text-right"
        v-model="moneyValue"
        v-bind="$attrs"
      />
    </IconField>
    <FieldPlaceholder width="8rem" :labelId="componentId" v-else />
    <small v-if="modelValue !== null" class="dues-note-field">{{
      getDuesNote(modelValue)
    }}</small>
  </div>
</template>

<script setup lang="ts">
import {
  fieldCSS,
  fieldLabelCSS,
  fieldTextCSS,
} from "@/components/field/common";
import { computeMoney } from "@/composables/fields/money/computeMoney";
import { getDuesFlag } from "@/composables/fields/money/getDuesFlag";
import { getDuesNote } from "@/composables/fields/money/getDuesNote";
import type { ModelRef } from "vue";
import type { WritableComputedRef } from "vue";

function getDuesFieldTextCSS(dues: number): string {
  if (dues > 0) {
    return fieldTextCSS + " p-invalid";
  }
  return fieldTextCSS;
}

const modelValue: ModelRef<number | null> = defineModel<number | null>({
  required: true,
});
const moneyValue: WritableComputedRef<string> = computeMoney(modelValue);
const componentId: string = generateId(useId());
</script>

<style>
small.dues-note-field {
  font-size: 1rem;
  font-weight: bold;
  text-align: right;
  color: var(--p-red-500);
}
</style>
