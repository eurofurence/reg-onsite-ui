<template>
    <div :class="getFieldCSS()">
        <label for="country" :class="getFieldLabelCSS()">Country</label>
        <span class="p-input-icon-left">
            <i :class="getFlagCSSClass(modelValue)" />
            <InputText
                id="country"
                :class="getFieldTextCSS()"
                class="w-10rem"
                :modelValue="getCountryName(modelValue)"
                @update:modelValue="$emit('update:modelValue', $event)"
                v-bind="$attrs"
            />
        </span>
    </div>
</template>

<script setup>
import { getFieldCSS, getFieldLabelCSS, getFieldTextCSS } from "@/components/fields/fields";

import { getFlagCSSClass, getCountryName } from "@/composables/fields/useCountry";
import InputText from "primevue/inputtext";

// eslint-disable-next-line no-undef
const modelValue = defineModel();
</script>
