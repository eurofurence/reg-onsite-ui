<template>
  <div :class="fieldCSS">
    <label :for="componentId" :class="fieldLabelCSS">Day Attendance</label>
    <SelectButton
      :id="componentId"
      :class="fieldTextCSS"
      class="h-12"
      v-model="dayAttendanceSubset"
      :pt:pcToggleButton:content="configureDefaultButtonStyle"
      :options="getConventionSetup().metadata.forDayAttendance.list"
      optionValue="value"
      optionLabel="label"
      multiple
      v-bind="$attrs"
    />
  </div>
</template>

<script setup lang="ts">
import {
    fieldCSS,
    fieldLabelCSS,
    fieldTextCSS,
} from "@/components/common/field/common/common";
import { configureDefaultButtonStyle } from "@/composables/fields/configureButtonStyles";
import { computeInclusivePackagePresence } from "@/composables/fields/packages/computeInclusivePackagePresence";
import { generateId } from "@/composables/generateId";
import { getConventionSetup } from "@/composables/logic/getConventionSetup";
import type { AttendanceValue } from "@/config/metadata/packages/metadataForAttendance";
import type { PackageCountType } from "@/types/external/attsrv/attendees/attendee";
import SelectButton from "@/volt/SelectButton.vue";
import { useId, type ModelRef, type WritableComputedRef } from "vue";

const modelValue: ModelRef<PackageCountType[] | null> = defineModel<
  PackageCountType[] | null
>({ required: true });
const dayAttendanceSubset: WritableComputedRef<AttendanceValue[] | null> =
  computeInclusivePackagePresence<AttendanceValue>(
    modelValue,
    getConventionSetup().metadata.forDayAttendance.list
  );
const componentId: string = generateId(useId());
</script>
