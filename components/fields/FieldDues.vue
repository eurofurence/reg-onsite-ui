<template>
    <div :class="getFieldCSS()">
        <label for="dues" :class="getFieldLabelCSS()">Open Payments</label>
        <span class="p-input-icon-left">
            <i :class="getDuesFlag(modelValue)" />
            <InputText
                v-tooltip.hover="{
                    value: `${getDuesNote(modelValue)}`,
                    showDelay: 0,
                    hideDelay: 1000,
                }"
                id="dues"
                :class="getDuesFieldTextCSS(modelValue)"
                class="w-9rem text-right"
                :modelValue="getDuesText(modelValue)"
                @update:modelValue="updateModelValue"
                v-bind="$attrs"
            />
        </span>
        <small id="dues-note" class="text-right">{{ getDuesNote(modelValue) }}</small>
    </div>
</template>

<script setup>
import { getFieldCSS, getFieldLabelCSS, getFieldTextCSS } from "@/components/fields/fields";
import InputText from "primevue/inputtext";
import { parseDues, getDuesText, getDuesFlag, getDuesNote } from "@/composables/getDues";

function getDuesFieldTextCSS(dues) {
    if (dues > 0) {
        return getFieldTextCSS() + " p-invalid";
    }
    return getFieldTextCSS();
}

function updateModelValue(value) {
    emit("update:modelValue", parseDues(value));
}

defineProps(["modelValue"]);
const emit = defineEmits(["update:modelValue"]);
</script>

<style>
#dues-note {
    font-size: 1rem;
    font-weight: bold;
    color: var(--red-500);
}
</style>
