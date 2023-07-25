<template>
    <div class="flex align-items-center gap-2">
        <span :class="getFlagCSSClass(modelValue)"></span>
        <span>{{ getCountryName(modelValue) }}</span>
    </div>
</template>

<script setup>
import { getFlagCSSClass, getCountryName } from "@/composables/fields/useCountry";

defineProps(["modelValue"]);
</script>
