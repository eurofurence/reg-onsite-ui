<template>
    <Dropdown
        v-model="modelValue"
        @change="filterCallback()"
        :options="configItems"
        optionValue="value"
        optionLabel="label"
        class="p-column-filter"
        :maxSelectedLabels="1"
    >
        <template #option="slotProps">
            <TagElement :modelValue="slotProps.option.value" :configItems="configItems" />
        </template>
        <template #value="slotProps">
            <div v-if="slotProps.value === null">Search by role</div>
            <div v-else>
                <TagElement :modelValue="slotProps.value" :configItems="configItems" />
            </div>
        </template>
    </Dropdown>
</template>

<script setup>
import Dropdown from "primevue/dropdown";

import TagElement from "@/components/element/TagElement.vue";

// eslint-disable-next-line no-undef
const modelValue = defineModel();
defineProps(["filterCallback", "configItems", "maxSelectedLabels"]);
</script>
