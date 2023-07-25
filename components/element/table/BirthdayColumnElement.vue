<template>
    <div class="flex align-items-center gap-2">
        <span>{{ modelValue }}</span>
        <span :class="getBirthdayFlag(modelValue)"></span>
    </div>
</template>

<script setup>
import { getBirthdayFlag } from "@/composables/getAge";

defineProps(["modelValue"]);
</script>
