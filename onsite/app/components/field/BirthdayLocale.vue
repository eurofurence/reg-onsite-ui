<template>
  <div :class="fieldCSS">
    <label :for="componentId" :class="fieldLabelCSS">Birthday</label>
    <IconField v-if="modelValue.birthday !== null">
      <InputIcon :class="getBirthdayFlag(modelValue.transAge || 0)" />
      <InputText
        v-tooltip="{
          value: `${getBirthdayNote(modelValue.transAge || 0)}`,
          showDelay: 0,
          hideDelay: 1000,
        }"
        :id="componentId"
        :class="getBirthdayFieldTextCSS(modelValue.transAge || 0)"
        class="w-36 text-right"
        :modelValue="computeBirthdayFormat"
        v-bind="$attrs"
      />
    </IconField>
    <FieldPlaceholder width="9rem" :labelId="componentId" v-else />
    <small v-if="modelValue.birthday !== null" class="birthday-note-field">{{
      getBirthdayNote(modelValue.transAge || 0)
    }}</small>
  </div>
</template>

<script setup lang="ts">
import {
  fieldCSS,
  fieldLabelCSS,
  fieldTextCSS,
} from "@/components/field/common/common";
import { getBirthdayFlag } from "@/composables/fields/birthday/getBirthdayFlag";
import { getBirthdayNote } from "@/composables/fields/birthday/getBirthdayNote";
import { isValidAge } from "@/composables/fields/birthday/isValidAge";
import type { ModelRef } from "vue";
import type { TransformedAttendeeInfo } from "@/types/internal/attendee";

function getBirthdayFieldTextCSS(birthday: number): string {
  if (!isValidAge(birthday)) {
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

<style>
small.birthday-note-field {
  font-size: 1rem;
  font-weight: bold;
  text-align: right;
  color: var(--p-red-500);
}
</style>
