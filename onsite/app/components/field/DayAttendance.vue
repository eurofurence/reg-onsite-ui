<template>
  <div :class="fieldCSS">
    <label :for="componentId" :class="fieldLabelCSS">Day Attendance</label>
    <SelectButton
      :id="componentId"
      :class="fieldTextCSS"
      v-model="dayAttendanceSubset"
      :options="configDayAttendanceItems"
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
} from "@/components/field/common";
import { computePackageSubset } from "@/composables/fields/packages/computePackageSubset";
import type { DayAttendanceValue } from "@/config/setupDayAttendance";
import { configDayAttendanceItems } from "@/setupEFIteration";
import type { PackageApiValue, PackageCountType } from "@/types/external";
import type { WritableComputedRef } from "vue";
import type { ModelRef } from "vue";

const modelValue: ModelRef<PackageCountType<PackageApiValue>[] | null> =
  defineModel<PackageCountType<PackageApiValue>[] | null>({ required: true });
const dayAttendanceSubset: WritableComputedRef<DayAttendanceValue[] | null> =
  computePackageSubset<DayAttendanceValue>(
    modelValue,
    configDayAttendanceItems
  );
const componentId: string = generateId(useId());
</script>
