<template>
  <div :class="fieldCSS">
    <label :for="componentId" :class="fieldLabelCSS">Birthday</label>
    <div class="m-px relative" v-if="modelValue.birthday !== null">
      <i
        :class="getBirthdayFlag(modelValue.transAge)"
        class="absolute top-1/2 -mt-2 text-surface-400 leading-none start-3 z-1"
      />
      <InputText
        v-tooltip="{
          value: `${getBirthdayNote(modelValue.transAge || 0 as AgeInYears)}`,
          showDelay: 0,
          hideDelay: 1000,
        }"
        pt:root="ps-10"
        :id="componentId"
        :class="getBirthdayFieldTextCSS(modelValue.transAge || 0 as AgeInYears)"
        class="w-36 h-12 text-right"
        :modelValue="computeBirthdayFormat"
        v-bind="$attrs"
      />
    </div>
    <div v-else>
      <Placeholder width="9rem" :labelId="componentId" />
    </div>
    <small
      v-if="modelValue.birthday !== null"
      class="text-sm font-bold text-right text-red-500"
      >{{ getBirthdayNote(modelValue.transAge || (0 as AgeInYears)) }}</small
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
import { getBirthdayFlag } from "@/composables/fields/birthday/getBirthdayFlag";
import { getBirthdayNote } from "@/composables/fields/birthday/getBirthdayNote";
import { isValidAge } from "@/composables/fields/birthday/isValidAge";
import { generateId } from "@/composables/generateId";
import type {
  AgeInYears,
  TransformedAttendeeInfo,
} from "@/types/internal/attendee";
import InputText from "@/volt/InputText.vue";
import { computed, useId, type ComputedRef, type ModelRef } from "vue";

function getBirthdayFieldTextCSS(age: AgeInYears): string {
  if (!isValidAge(age)) {
    return fieldTextCSS + " p-invalid";
  }
  return fieldTextCSS;
}

const computeBirthdayFormat: ComputedRef<string> = computed(() => {
  if (
    modelValue.value === null ||
    modelValue.value.birthday === null ||
    modelValue.value.country === null
  ) {
    return "yyyy-mm-dd";
  }
  const birthdayDate = new Date(modelValue.value.birthday);
  const userLocale: Intl.DateTimeFormat = new Intl.DateTimeFormat(
    modelValue.value.country
  );
  return userLocale.format(birthdayDate);
});

const modelValue: ModelRef<TransformedAttendeeInfo> =
  defineModel<TransformedAttendeeInfo>({
    required: true,
  });
const componentId: string = generateId(useId());
</script>
