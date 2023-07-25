<template>
    <div id="spoken_languages" :class="getFieldCSS()">
        <label for="spoken_languages" :class="getFieldLabelCSS()">Spoken Languages</label>
        <Chips :model-value="getSpokenLanguages()" disabled :class="getFieldTextCSS()" />
    </div>
</template>

<script setup>
import { getFieldCSS, getFieldLabelCSS, getFieldTextCSS } from "@/components/fields/fields";
import { configLanguageItems } from "@/composables/useSpokenLanguages";
import Chips from "primevue/chips";

function mapSpokenLanguage(spokenLanguageValue) {
    const defaultItem = {
        value: spokenLanguageValue,
        label: spokenLanguageValue,
    };
    const spokenLanguageItem = configLanguageItems.find((item) => item.value === spokenLanguageValue) || defaultItem;
    return spokenLanguageItem.label;
}

function getSpokenLanguages() {
    return props.modelValue?.split(",").map(mapSpokenLanguage);
}

const props = defineProps(["modelValue"]);
</script>

<style>
#spoken_languages > .p-chips .p-chips-multiple-container .p-chips-token .p-chips-token-icon {
    display: none;
}

#spoken_languages > .p-chips .p-chips-multiple-container .p-chips-input-token {
    display: none;
}
</style>
