<template>
    <div :class="getFieldCSS()">
        <label for="status" :class="getFieldLabelCSS()">Status</label>
        <div class="pt-1" id="status" v-if="propertyMap[modelValue]">
            <Chip
                :class="getStatusCSS(propertyMap[modelValue])"
                class="w-10rem"
                :label="propertyMap[modelValue]?.label"
                :icon="propertyMap[modelValue]?.icon"
                v-bind="$attrs"
            />
        </div>
        <div v-else>Unknown: {{ modelValue }}</div>
    </div>
</template>

<script setup>
import { getFieldCSS, getFieldLabelCSS, getFieldTextCSS } from "@/components/fields/fields";
import { configStatusItems } from "@/ef.config";
import { convertListToMap } from "@/composables/convertListToMap";
import Chip from "primevue/chip";

const propertyMap = convertListToMap(configStatusItems);

function getStatusCSS(properties) {
    const mainStyle = getFieldTextCSS() + ` bg-${properties.color} text-white`;
    if (props.disabled === "") {
        return `${mainStyle} p-disabled`;
    }
    return mainStyle;
}

const props = defineProps(["modelValue", "disabled"]);
</script>
