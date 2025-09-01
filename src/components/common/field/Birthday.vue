<template>
  <div :class="fieldCSS">
    <label :for="componentId" :class="fieldLabelCSS">Birthday</label>
    <div class="m-px relative" v-if="modelValue !== null">
      <i
        :class="getBirthdayFlag(computeAgeRef)"
        class="absolute top-1/2 -mt-2 text-surface-400 leading-none start-3 z-1"
      />
      <InputText
        v-tooltip="{
          value: `${getBirthdayNote(computeAgeRef)}`,
          showDelay: 0,
          hideDelay: 1000,
        }"
        pt:root="ps-10"
        :id="componentId"
        :class="getBirthdayFieldTextCSS(computeAgeRef)"
        class="w-36 h-12 text-right"
        v-model="modelValue"
        v-bind="$attrs"
      />
    </div>
    <div v-else>
      <Placeholder width="9rem" :labelId="componentId" />
    </div>
    <small v-if="modelValue !== null" class="text-sm font-bold text-right text-red-500">{{
      getBirthdayNote(computeAgeRef)
    }}</small>
  </div>
</template>

<script setup lang="ts">
import {
  fieldCSS,
  fieldLabelCSS,
  fieldTextCSS,
} from "@/components/common/field/common/common";
import Placeholder from "@/components/common/field/Placeholder.vue";
import { getAge } from "@/composables/fields/birthday/getAge";
import { getBirthdayFlag } from "@/composables/fields/birthday/getBirthdayFlag";
import { getBirthdayNote } from "@/composables/fields/birthday/getBirthdayNote";
import { isValidAge } from "@/composables/fields/birthday/isValidAge";
import { generateId } from "@/composables/generateId";
import type { IsoBirthdayStr } from "@/types/external/attsrv/attendees/attendee";
import type { AgeInYears } from "@/types/internal/attendee";
import InputText from "@/volt/InputText.vue";
import { computed, useId, type ComputedRef, type ModelRef } from "vue";

function getBirthdayFieldTextCSS(age: AgeInYears | null): string {
  if (!isValidAge(age)) {
    return fieldTextCSS + " p-invalid";
  }
  return fieldTextCSS;
}

const computeAgeRef: ComputedRef<AgeInYears | null> = computed(() =>
  getAge(modelValue.value)
);

const modelValue: ModelRef<IsoBirthdayStr | null> =
  defineModel<IsoBirthdayStr | null>({
    required: true,
  });
const componentId: string = generateId(useId());
</script>
