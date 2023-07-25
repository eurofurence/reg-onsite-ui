<template>
    <div :class="getFieldCSS()">
        <label for="nickname" :class="getFieldLabelCSS()">Nickname</label>
        <InputText id="nickname" :class="getFieldTextCSS()" v-model="modelValue" v-bind="$attrs" />
    </div>
</template>

<script setup>
import { getFieldCSS, getFieldLabelCSS, getFieldTextCSS } from "@/components/fields/fields";
import InputText from "primevue/inputtext";

// eslint-disable-next-line no-undef
const modelValue = defineModel();
</script>
