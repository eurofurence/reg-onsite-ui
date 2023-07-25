<template>
    <div :class="getFieldCSS()">
        <label :class="getFieldLabelCSS()" for="items">Items</label>
        <div class="items-checkbox-list gap-1">
            <div v-for="item of props.owedAndOwnedTrinketItemList" :key="item.value" class="flex align-items-center">
                <Checkbox
                    :modelValue="props.modelValue"
                    @update:modelValue="$emit('update:modelValue', $event)"
                    :inputId="item.value"
                    name="itemGroup"
                    :value="item.value"
                    :disabled="disabled"
                />
                <label :class="getFieldTextCSS()" class="ml-2 checkbox-label" :for="item.value" :disabled="disabled">{{ getItemLabel(item) }}</label>
            </div>
        </div>
        <div v-if="props.owedAndOwnedTrinketItemList?.length === 0">Nothing to issue...</div>
    </div>
</template>

<script setup>
import { getFieldCSS, getFieldLabelCSS, getFieldTextCSS } from "@/components/fields/fields";
import { configTShirtItems } from "@/ef.config";
import Checkbox from "primevue/checkbox";

const tshirtNameMap = configTShirtItems.reduce((result, item) => ({ ...result, [item.value]: item.label }), {});

function getItemLabel(item) {
    if (item.value != "tshirt") {
        return item.label;
    } else {
        return `${item.label}: ${tshirtNameMap[props.tshirtValue]}`;
    }
}

const props = defineProps(["modelValue", "tshirtValue", "owedAndOwnedTrinketItemList", "disabled"]);
defineEmits(["update:modelValue"]);
</script>

<style>
.items-checkbox-list {
    display: grid;
    grid-template-columns: 1fr;
}

/* Switch to two columns if screen is wider than 1200px */
@media (min-width: 1200px) {
    .items-checkbox-list {
        display: grid;
        grid-template-columns: 1fr 1fr;
    }
}
</style>
