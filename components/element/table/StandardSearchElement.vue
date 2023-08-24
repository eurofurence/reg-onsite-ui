<template>
    <div v-if="autoCompleteFieldData">
        <AutoComplete
            v-model="modelValue"
            @input="filterCallback()"
            @item-select="filterCallback()"
            class="p-column-filter"
            :placeholder="placeholder"
            :suggestions="suggestions"
            @complete="search"
        />
    </div>
    <div v-else>
        <InputText v-model="modelValue" @input="filterCallback()" class="p-column-filter" :placeholder="placeholder" />
    </div>
</template>

<script setup>
import { ref, computed } from "vue";
import AutoComplete from "primevue/autocomplete";
import InputText from "primevue/inputtext";

const suggestions = ref([]);

const autoCompleteFieldData = computed({
    get: () => autoCompleteData.value.map((item) => item[props.autoCompleteField]),
});

async function search(event) {
    try {
        suggestions.value = autoCompleteFieldData.value.filter((entry) => entry.toLowerCase().startsWith(event.query.toLowerCase()));
    } catch (error) {
        suggestions.value = [];
    }
}

// eslint-disable-next-line no-undef
const modelValue = defineModel();
// eslint-disable-next-line no-undef
const autoCompleteData = defineModel("autoCompleteData");

const props = defineProps(["filterCallback", "placeholder", "autoCompleteField"]);
</script>
