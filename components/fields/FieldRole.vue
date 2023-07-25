<template>
    <div :class="getFieldCSS()">
        <label for="roles" :class="getFieldLabelCSS()">Roles</label>
        <div class="flex flex-rows gap-1 pt-1" id="roles">
            <div v-for="item of getRoleItems()" :key="item.value">
                <Chip :class="getRoleCSS(item)" :label="item.label" v-bind="$attrs" />
            </div>
        </div>
    </div>
</template>

<script setup>
import { getFieldCSS, getFieldLabelCSS, getFieldTextCSS } from "@/components/fields/fields";
import { configRoleItems } from "@/ef.config";
import Chip from "primevue/chip";

function getRoleItems() {
    return configRoleItems.filter((role) => props.modelValue?.includes(role.value));
}

function getRoleCSS(item) {
    const mainStyle = getFieldTextCSS() + ` bg-${item.color} text-white`;
    if (props.disabled === "") {
        return `${mainStyle} p-disabled`;
    }
    return mainStyle;
}

const props = defineProps(["modelValue", "disabled"]);
</script>
