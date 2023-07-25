<template>
    <div :class="getFieldCSS()">
        <label for="pronouns" :class="getFieldLabelCSS()">Pronouns</label>
        <InputText id="pronouns" :class="getPronounFieldTextCSS(modelValue)" v-model="modelValue" v-bind="$attrs" />
    </div>
</template>

<script setup>
import { getFieldCSS, getFieldLabelCSS, getFieldTextCSS } from "@/components/fields/fields";
import InputText from "primevue/inputtext";

function getPronounFieldTextCSS(value) {
    if (value?.length > 10) {
        return getFieldTextCSS();
    }
    return `${getFieldTextCSS()} w-8rem`;
}

// eslint-disable-next-line no-undef
const modelValue = defineModel();
</script>
