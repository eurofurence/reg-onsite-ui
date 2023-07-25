<template>
    <div :class="getFieldCSS()">
        <label for="conbookChoice" :class="getFieldLabelCSS()">Conbook</label>
        <SelectButton
            id="conbookChoice"
            :class="getFieldTextCSS()"
            v-model="modelValue"
            :options="configConbookItems"
            optionValue="value"
            optionLabel="label"
            v-bind="$attrs"
        />
    </div>
</template>

<script setup>
import { getFieldCSS, getFieldLabelCSS, getFieldTextCSS } from "@/components/fields/fields";
import { configConbookItems } from "@/ef.config";
import SelectButton from "primevue/selectbutton";

// eslint-disable-next-line no-undef
const modelValue = defineModel();
</script>
