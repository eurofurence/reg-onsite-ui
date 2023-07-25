<template>
    <div :class="getFieldCSS()">
        <label for="attendance" :class="getFieldLabelCSS()">Attendance</label>
        <SelectButton
            id="attendance"
            :class="getFieldTextCSS()"
            v-model="modelValue"
            :options="configDayAttendanceItems"
            optionValue="value"
            optionLabel="label"
            multiple
            v-bind="$attrs"
        />
    </div>
</template>

<script setup>
import { getFieldCSS, getFieldLabelCSS, getFieldTextCSS } from "@/components/fields/fields";
import { configDayAttendanceItems } from "@/ef.config";
import SelectButton from "primevue/selectbutton";

// eslint-disable-next-line no-undef
const modelValue = defineModel();
</script>
