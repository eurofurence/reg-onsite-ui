<template>
    <InputMask
        v-model="modelValue"
        @change="filterCallback()"
        class="p-column-filter"
        placeholder="yyyy-mm-dd"
        mask="9999-99-99"
        slotChar="yyyy-mm-dd"
        :autoClear="false"
    />
</template>

<script setup>
import InputMask from "primevue/inputmask";

// eslint-disable-next-line no-undef
const modelValue = defineModel();
defineProps(["filterCallback"]);
</script>
