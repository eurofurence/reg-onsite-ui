<template>
    <AvailableItemsDialog ref="availableItemsDialog" v-model="itemConfig.available" />
    <SplitButton label="Select Available" @click="selectAvailable" :model="selectAvailableDropdown" outlined />
</template>

<script setup>
import { ref } from "vue";

import { setupKeyEvents } from "@/composables/setupKeyEvents";
import { configTinketItems } from "@/ef.config";
import { useCookieStruct } from "@/composables/useCookieStruct";

import SplitButton from "primevue/splitbutton";
import AvailableItemsDialog from "@/components/dialog/AvailableItemsDialog.vue";

const availableItemsDialog = ref(null);

const itemConfig = useCookieStruct("sponsorItems", {
    available: configTinketItems.map((item) => item.value),
});

const selectAvailableDropdown = [
    {
        label: "Configure",
        icon: "pi pi-cog",
        command: () => {
            availableItemsDialog.value.run();
        },
    },
];

function selectAvailable() {
    const owedAndOwnedTrinketItemList = props.owedAndOwnedTrinketItemList;
    const issuingTrinketItemList = owedAndOwnedTrinketItemList.filter((item) => itemConfig.value.available.includes(item.value));
    const issuingTrinketValueList = issuingTrinketItemList.map((item) => item.value);
    modelValue.value = [...new Set([...(modelValue.value || []), ...issuingTrinketValueList])].sort();
}

setupKeyEvents("keydown", (key) => key === "a", selectAvailable);

// eslint-disable-next-line no-undef
const modelValue = defineModel();
const props = defineProps(["owedAndOwnedTrinketItemList"]);
</script>
