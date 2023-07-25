<template>
    <div :class="getFieldCSS()" class="w-10rem">
        <label for="regid" :class="getFieldLabelCSS()">Registration Number</label>
        <InputText id="regid" :class="getFieldTextCSS()" v-model="modelValue" v-bind="$attrs" />
    </div>
</template>

<script setup>
import { getFieldCSS, getFieldLabelCSS, getFieldTextCSS } from "@/components/fields/fields";
import InputText from "primevue/inputtext";

// eslint-disable-next-line no-undef
const modelValue = defineModel();
</script>
