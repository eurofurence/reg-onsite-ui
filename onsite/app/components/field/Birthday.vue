<template>
  <div :class="fieldCSS">
    <label :for="componentId" :class="fieldLabelCSS">Birthday</label>
    <IconField v-if="modelValue !== null">
      <InputIcon :class="getBirthdayFlag(computeAgeRef)" />
      <InputText
        v-tooltip="{
          value: `${getBirthdayNote(computeAgeRef)}`,
          showDelay: 0,
          hideDelay: 1000,
        }"
        :id="componentId"
        :class="getBirthdayFieldTextCSS(computeAgeRef)"
        class="w-36 text-right"
        v-model="modelValue"
        v-bind="$attrs"
      />
    </IconField>
    <FieldPlaceholder width="9rem" :labelId="componentId" v-else />
    <small v-if="modelValue !== null" class="birthday-note-field">{{
      getBirthdayNote(computeAgeRef)
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
import { getAge } from "@/composables/fields/birthday/getAge";
import type { AgeInYears } from "@/types/internal/attendee";
import type { IsoBirthdayStr } from "@/types/external/attsrv/attendees/attendee";

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

<style lang="css">
small.birthday-note-field {
  font-size: 1rem;
  font-weight: bold;
  text-align: right;
  color: var(--p-red-500);
}
</style>
