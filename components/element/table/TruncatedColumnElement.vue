<template>
    <span v-tooltip.right="getTooltip(modelValue)">{{ truncateString(modelValue) }}</span>
</template>

<script setup>
function getTooltip(value) {
    if (value.length > props.maxLength) {
        return value;
    }
    return "";
}

function truncateString(value) {
    if (value.length > props.maxLength) {
        return value.substring(0, props.maxLength) + "...";
    }
    return value;
}

const props = defineProps(["modelValue", "maxLength"]);
</script>
