<template>
    <div class="flex align-items-center gap-2">
        <span :style="getDuesStyle(modelValue)">{{ getDuesText(modelValue) }}</span>
        <span :class="getDuesFlag(modelValue)"></span>
    </div>
</template>

<script setup>
import { getDuesText, getDuesFlag } from "@/composables/getDues";

function getDuesStyle(value) {
    if (value > 0) {
        return { color: "var(--red-500)" };
    } else if (value < 0) {
        return { color: "var(--green-600)" };
    } else {
        return {};
    }
}

defineProps(["modelValue"]);
</script>
