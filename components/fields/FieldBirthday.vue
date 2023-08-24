<template>
    <div :class="getFieldCSS()">
        <label for="birthday" :class="getFieldLabelCSS()">Birthday</label>
        <span class="p-input-icon-left">
            <i :class="getBirthdayFlag(modelValue)" />
            <InputText
                v-tooltip="{
                    value: `${getBirthdayNote(modelValue)}`,
                    showDelay: 0,
                    hideDelay: 1000,
                }"
                id="birthday"
                :class="getBirthdayFieldTextCSS(modelValue)"
                class="w-9rem text-right"
                :modelValue="modelValue"
                @update:modelValue="$emit('update:modelValue', $event)"
                v-bind="$attrs"
            />
        </span>
        <small id="birthday-note" class="text-right">{{ getBirthdayNote(modelValue) }}</small>
    </div>
</template>

<script setup>
import { getFieldCSS, getFieldLabelCSS, getFieldTextCSS } from "@/components/fields/fields";
import InputText from "primevue/inputtext";
import { getAge, getBirthdayFlag, getBirthdayNote } from "@/composables/getAge";

function getBirthdayFieldTextCSS(birthday) {
    if (getAge(birthday) < 18) {
        return getFieldTextCSS() + " p-invalid";
    }
    return getFieldTextCSS();
}

// eslint-disable-next-line no-undef
const modelValue = defineModel();
</script>

<style>
#birthday-note {
    font-size: 1rem;
    font-weight: bold;
    color: var(--red-500);
}
</style>
