<template>
    <div :class="getFieldCSS()">
        <label for="configOtherItems" :class="getFieldLabelCSS()">Other Options</label>
        <SelectButton
            id="configOtherItems"
            :class="getFieldTextCSS()"
            v-model="modelValue"
            :options="configOtherItems"
            optionValue="value"
            optionLabel="label"
            multiple
            v-bind="$attrs"
        />
    </div>
</template>

<script setup>
import { getFieldCSS, getFieldLabelCSS, getFieldTextCSS } from "@/components/fields/fields";
import { configOtherItems } from "@/ef.config";
import SelectButton from "primevue/selectbutton";

// eslint-disable-next-line no-undef
const modelValue = defineModel();
</script>
