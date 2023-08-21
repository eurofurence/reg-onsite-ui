<template>
    <div class="flex flex-column">
        <div v-if="props.modelValue">
            <Message :closable="false" severity="info" v-if="errorMessage == ''">
                Searching for registration number "{{ props.modelValue }}"
            </Message>
            <ProgressBar mode="indeterminate">Loading...</ProgressBar>
        </div>
        <div v-else>
            <Message :closable="false" severity="info" v-if="errorMessage == ''">{{ defaultMessage }}</Message>
            <Message :closable="false" severity="warn" v-else>{{ errorMessage }}</Message>
        </div>
    </div>
</template>

<script setup>
import Message from "primevue/message";
import ProgressBar from "primevue/progressbar";

const defaultMessage = "No pending operations ...";
const props = defineProps(["modelValue", "errorMessage"]);
</script>
