<template>
    <Message :severity="severity" class="stm-message" :closable="false">
        <template #messageicon>
            <i class="pi pi-info-circle stm-icon"></i>
        </template>
        <div class="stm-header">{{ title }}</div>
        <div class="stm-content">
            <slot></slot>
        </div>
    </Message>
</template>

<script setup>
import Message from "primevue/message";

defineProps(["severity", "title"]);
</script>

<style>
.stm-message {
    max-width: 80vw;
}

.stm-icon {
    width: 4rem;
    font-size: 3rem;
    margin-left: 0rem;
    margin-right: 1rem;
}

.stm-header {
    font-size: 1.75rem;
    font-weight: bold;
}

.stm-content {
    font-size: 1.5rem;
    max-width: 70vw;
}

.stm-content > ul {
    margin: 0.25em;
    padding: 0.5rem;
}

.stm-content > ul > li {
    white-space: normal;
}
</style>
