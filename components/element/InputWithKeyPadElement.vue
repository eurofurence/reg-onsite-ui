<template>
    <div id="abc" class="p-inputgroup flex-auto pt-3 pb-1 xyz">
        <span class="p-inputgroup-addon">
            <i class="pi pi-user"></i>
        </span>
        <span class="p-float-label">
            <InputNumber
                ref="idInput"
                id="idInput"
                v-model="modelValue"
                @value="onNumberSubmit"
                :useGrouping="false"
                :min="0"
                :max="maxNumber"
                :pt="{ input: { autofocus: true } }"
            />
            <label for="idInput">Registration Number</label>
        </span>
    </div>
    <div>
        <KeyPadElement v-model="modelValue" @numberSubmit="onNumberSubmit" :max="maxNumber" :severityOK="severityOK" />
    </div>
</template>

<script setup>
import { ref } from "vue";

import { setupKeyEvents } from "@/composables/setupKeyEvents";

import KeyPadElement from "@/components/element/KeyPadElement.vue";
import InputNumber from "primevue/inputnumber";

const idInput = ref(null);

function getInputElement() {
    return idInput.value.$el.querySelector("input");
}

function focusRegNumberInput() {
    const inputElement = getInputElement();
    inputElement.focus();
    inputElement.setSelectionRange(inputElement.value.length, inputElement.value.length);
}

function resetRegNumber() {
    getInputElement().blur();
    modelValue.value = null;
}

function onNumberSubmit() {
    getInputElement().blur();
    const number = parseInt(getInputElement().value);
    if (!isNaN(number)) {
        emit("numberSubmit", number);
    }
}

setupKeyEvents("keydown", (key) => key === "escape", resetRegNumber);
setupKeyEvents("keydown", (key) => key >= 0 && key <= 9, focusRegNumberInput);
setupKeyEvents("keydown", (key) => key === "backspace", focusRegNumberInput);
// Focus input element to prevent button presses
setupKeyEvents("keydown", (key) => key === "enter", focusRegNumberInput);
// Submit when key up so input field is in proper state
setupKeyEvents("keyup", (key) => key === "enter", onNumberSubmit);

// eslint-disable-next-line no-undef
const modelValue = defineModel();
defineProps(["maxNumber", "severityOK"]);
const emit = defineEmits(["numberSubmit"]);
</script>

<style>
#idInput > .p-inputnumber-input {
    font-size: 2.5rem;
    font-weight: bold;
    font-family: monospace;
    text-align: right;
}
</style>
