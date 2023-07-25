<template>
    <div :class="getFieldCSS()">
        <label for="sponsorLevel" :class="getFieldLabelCSS()">Sponsor Level</label>
        <SelectButton
            id="sponsorLevel"
            :class="getFieldTextCSS()"
            v-model="modelValue"
            :options="props.sponsorItems || configRegdeskSponsorItems"
            optionValue="value"
            optionLabel="label"
            v-bind="$attrs"
        />
    </div>
</template>

<script setup>
import { getFieldCSS, getFieldLabelCSS, getFieldTextCSS } from "@/components/fields/fields";
import { configSponsorItems } from "@/ef.config";
import SelectButton from "primevue/selectbutton";

function getPanelTheme() {
    const sponsorOptionItem = configSponsorItems.find((item) => item.value == modelValue.value);
    return `var(--${sponsorOptionItem?.color})`;
}

// eslint-disable-next-line no-undef
const modelValue = defineModel();
const props = defineProps(["sponsorItems"]);
</script>

<style>
#sponsorLevel > .p-highlight {
    background: v-bind("getPanelTheme()");
}
</style>
