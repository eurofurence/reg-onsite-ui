<template>
    <div :class="getFieldCSS()">
        <label for="dealer" :class="getFieldLabelCSS()">Dealer's Den</label>
        <Dropdown
            id="dealer"
            :class="getFieldTextCSS()"
            v-model="modelValue"
            :options="configDealerItems"
            optionValue="value"
            optionLabel="label"
            placeholder="No Dealer"
            v-bind="$attrs"
        />
    </div>
</template>

<script setup>
import { getFieldCSS, getFieldLabelCSS, getFieldTextCSS } from "@/components/fields/fields";
import { configDealerItems } from "@/ef.config";
import Dropdown from "primevue/dropdown";

// eslint-disable-next-line no-undef
const modelValue = defineModel();
</script>
