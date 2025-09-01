<template>
  <div :class="fieldCSS">
    <label :for="componentId" :class="fieldLabelCSS">Open Payments</label>
    <div class="relative" v-if="modelValue !== null">
      <i
        :class="getDuesFlag(modelValue)"
        class="absolute top-1/2 -mt-2 text-surface-400 leading-none start-3 z-1"
      />
      <InputText
        v-tooltip.hover="{
          value: `${getDuesNote(modelValue)}`,
          showDelay: 0,
          hideDelay: 1000,
        }"
        pt:root="ps-10"
        :id="componentId"
        :class="getDuesFieldTextCSS(modelValue)"
        class="w-32 h-12 text-right"
        v-model="moneyValue"
        v-bind="$attrs"
      />
    </div>
    <Placeholder width="8rem" :labelId="componentId" v-else />
    <small
      v-if="modelValue !== null"
      class="text-sm font-bold text-right text-red-500"
      >{{ getDuesNote(modelValue) }}</small
    >
  </div>
</template>

<script setup lang="ts">
import {
  fieldCSS,
  fieldLabelCSS,
  fieldTextCSS,
} from "@/components/common/field/common/common";
import Placeholder from "@/components/common/field/Placeholder.vue";
import { computeMoney } from "@/composables/fields/money/computeMoney";
import { getDuesFlag } from "@/composables/fields/money/getDuesFlag";
import { getDuesNote } from "@/composables/fields/money/getDuesNote";
import { generateId } from "@/composables/generateId";
import type { MoneyInCent } from "@/types/external/attsrv/attendees/attendee";
import InputText from "@/volt/InputText.vue";
import type { ModelRef, WritableComputedRef } from "vue";
import { useId } from "vue";

function getDuesFieldTextCSS(dues: MoneyInCent): string {
  if (dues > 0) {
    return fieldTextCSS + " p-invalid";
  }
  return fieldTextCSS;
}

const modelValue: ModelRef<MoneyInCent | null> =
  defineModel<MoneyInCent | null>({
    required: true,
  });
const moneyValue: WritableComputedRef<string> = computeMoney(modelValue);
const componentId: string = generateId(useId());
</script>
