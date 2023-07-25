<template>
    <MultiSelect
        v-model="modelValue"
        @change="filterCallback()"
        :options="configCountryItems"
        optionValue="value"
        optionLabel="label"
        placeholder="Filter by country"
        class="p-column-filter"
        :maxSelectedLabels="1"
        :pt="{
            checkbox: { class: 'tfcb' },
            checkboxContainer: { class: 'tfcbc' },
            checkboxIcon: { class: 'tfcbi' },
            header: { class: 'tfheader' },
            headerCheckboxContainer: { class: 'tfcbc' },
            headerCheckbox: { class: 'tfcb' },
            headerCheckboxIcon: { class: 'tfcbi' },
            item: { class: 'tfi' },
            wrapper: { style: { 'max-height': '20rem' } },
        }"
    >
        <template #option="slotProps">
            <CountryColumnElement :model-value="slotProps.option.value" />
        </template>
        <template #value="slotProps">
            <div v-if="slotProps.value?.length === 1">
                <CountryColumnElement :model-value="slotProps.value[0]" />
            </div>
            <div v-else>{{ slotProps.value?.length || 0 }} countries selected</div>
        </template>
    </MultiSelect>
</template>

<script setup>
import MultiSelect from "primevue/multiselect";

import CountryColumnElement from "@/components/element/table/CountryColumnElement.vue";

import { configCountryItems } from "@/composables/fields/useCountry";

// eslint-disable-next-line no-undef
const modelValue = defineModel();
defineProps(["filterCallback"]);
</script>

<style>
.p-checkbox-box.tfcb {
    width: 1.5rem;
    height: 1.5rem;
}

.tfheader:before {
    content: "Select all:";
    padding-right: 1.25rem;
}

.p-checkbox.p-component.tfcbc {
    width: 1.5rem;
    height: 1.5rem;
    border-radius: 0.2rem;
}

.p-checkbox .p-icon.p-checkbox-icon.tfcbi {
    width: 1rem;
    height: 1rem;
}

.p-multiselect-panel .p-multiselect-items .p-multiselect-item.tfi {
    padding: 10px 1rem;
}

.tfcb > .p-checkbox .p-checkbox-box .p-checkbox-icon.p-icon.p-highlight {
    width: 1rem;
    height: 1rem;
}
</style>
