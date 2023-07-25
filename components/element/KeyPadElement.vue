<template>
    <div class="keypad gap-1">
        <Button class="" @click="onNumber(7)" label="7" outlined></Button>
        <Button @click="onNumber(8)" label="8" outlined></Button>
        <Button @click="onNumber(9)" label="9" outlined></Button>
        <Button @click="onNumber(4)" label="4" outlined></Button>
        <Button @click="onNumber(5)" label="5" outlined></Button>
        <Button @click="onNumber(6)" label="6" outlined></Button>
        <Button @click="onNumber(1)" label="1" outlined></Button>
        <Button @click="onNumber(2)" label="2" outlined></Button>
        <Button @click="onNumber(3)" label="3" outlined></Button>
        <Button id="keypadback" @click="onRemove()" icon="pi pi-arrow-circle-left" outlined></Button>
        <Button @click="onNumber(0)" label="0" outlined></Button>
        <Button id="keypadok" @click="onSubmit()" icon="pi pi-search" :severity="severityOK"></Button>
    </div>
</template>

<script setup>
import Button from "primevue/button";

function onSubmit() {
    emit("numberSubmit", modelValue.value);
}

function onNumber(number) {
    const oldValue = modelValue.value || 0;
    const newValue = oldValue * 10 + number;
    if (newValue <= props.max) {
        modelValue.value = newValue;
    }
}

function onRemove() {
    const newValue = Math.floor(modelValue.value / 10);
    if (newValue == 0) {
        modelValue.value = null;
    } else {
        modelValue.value = newValue;
    }
}

// eslint-disable-next-line no-undef
const modelValue = defineModel();
const emit = defineEmits(["numberSubmit"]);
const props = defineProps(["max", "severityOK"]);
</script>

<style scoped>
.keypad {
    display: grid;
    grid-template-columns: 1fr 1fr 1fr;
}

.keypad > .p-button {
    padding: 0;
    aspect-ratio: 1;
    font-size: 3rem;
    font-weight: bold;
    font-family: monospace;
}

.keypad > .p-button.p-button-icon-only {
    width: auto;
}
</style>

<style>
#keypadok > .pi {
    font-size: 2.5rem;
}

#keypadback > .pi {
    font-size: 2.5rem;
}
</style>
