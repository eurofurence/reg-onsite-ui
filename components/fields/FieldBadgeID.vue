<template>
    <div :class="getFieldCSS()" class="w-6rem">
        <label for="badgeid" :class="getFieldLabelCSS()">Badge ID</label>
        <InputText id="badgeid" :class="getFieldTextCSS()" v-model="modelValue" v-bind="$attrs" />
    </div>
</template>

<script setup>
import { getFieldCSS, getFieldLabelCSS, getFieldTextCSS } from "@/components/fields/fields";
import InputText from "primevue/inputtext";

// eslint-disable-next-line no-undef
const modelValue = defineModel();
</script>
