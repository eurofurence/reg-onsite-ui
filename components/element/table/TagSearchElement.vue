<template>
    <MultiSelect
        v-model="modelValue"
        @change="filterCallback()"
        :options="configItems"
        optionValue="value"
        optionLabel="label"
        placeholder="Search by status"
        class="p-column-filter"
        :maxSelectedLabels="maxSelected"
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
            <TagElement :modelValue="slotProps.option.value" :configItems="configItems" />
        </template>
        <template #value="slotProps">
            <div v-if="slotProps.value?.length > 0 && slotProps.value?.length <= maxSelected" class="flex gap-1">
                <div v-bind:key="item" v-for="item in slotProps.value">
                    <TagElement :modelValue="item" :configItems="configItems" />
                </div>
            </div>
            <div v-else>{{ slotProps.value?.length || 0 }} items selected</div>
        </template>
    </MultiSelect>
</template>

<script setup>
import MultiSelect from "primevue/multiselect";

import TagElement from "@/components/element/TagElement.vue";

const maxSelected = props.maxSelectedLabels || 1;
// eslint-disable-next-line no-undef
const modelValue = defineModel();
const props = defineProps(["filterCallback", "configItems", "maxSelectedLabels"]);
</script>

<style scoped>
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
