<template>
    <div :class="getFieldCSS()">
        <label for="firstname" :class="getFieldLabelCSS()">First Name</label>
        <InputText id="firstname" :class="getFieldTextCSS()" v-model="modelValue" v-bind="$attrs" />
    </div>
</template>

<script setup>
import { getFieldCSS, getFieldLabelCSS, getFieldTextCSS } from "@/components/fields/fields";
import InputText from "primevue/inputtext";

// eslint-disable-next-line no-undef
const modelValue = defineModel();
</script>
