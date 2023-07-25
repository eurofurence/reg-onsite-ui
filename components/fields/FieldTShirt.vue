<template>
    <div :class="getFieldCSS()">
        <label for="tshirt_size" :class="getFieldLabelCSS()">T-Shirt Size</label>
        <Dropdown
            id="tshirt_size"
            :class="getFieldTextCSS()"
            v-model="modelValue"
            :options="configTShirtItems"
            optionValue="value"
            optionLabel="label"
            placeholder=""
            v-bind="$attrs"
        />
    </div>
</template>

<script setup>
import { getFieldCSS, getFieldLabelCSS, getFieldTextCSS } from "@/components/fields/fields";
import { configTShirtItems } from "@/ef.config";
import Dropdown from "primevue/dropdown";

// eslint-disable-next-line no-undef
const modelValue = defineModel();
</script>
