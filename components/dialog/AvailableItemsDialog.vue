<template>
    <ConfirmDialog group="itemsSelectAvailable" :closable="false">
        <template #message="slotProps">
            <div class="inline">
                <ScrollPanel>
                    <div id="selectItemsConfig">
                        <div v-for="item of configTinketItems" :key="'AV' + item.value" class="flex checkbox-area align-items-center mb-1">
                            <Checkbox class="large" v-model="modelValue" :inputId="'AV' + item.value" name="availableGroup" :value="item.value" />
                            <label class="ml-1 checkbox-label" :for="'AV' + item.value">{{ item.label }}</label>
                        </div>
                    </div>
                </ScrollPanel>
                {{ slotProps.message.message }}
            </div>
        </template>
    </ConfirmDialog>
</template>

<script setup>
import { configTinketItems } from "@/ef.config";
import { useConfirm } from "primevue/useconfirm";

import ConfirmDialog from "primevue/confirmdialog";
import Checkbox from "primevue/checkbox";
import ScrollPanel from "primevue/scrollpanel";

const confirm = useConfirm();

function run() {
    const oldModelValue = JSON.stringify(modelValue.value);
    confirm.require({
        group: "itemsSelectAvailable",
        header: "Configure Available Items",
        message: "Do you want to update the available items?",
        accept: () => {},
        reject: () => {
            modelValue.value = JSON.parse(oldModelValue);
        },
    });
}

// eslint-disable-next-line no-undef
const modelValue = defineModel();
defineExpose({ run });
</script>

<style>
#selectItemsConfig .checkbox-label {
    font-size: 2rem;
}

#selectItemsConfig .p-checkbox {
    height: 3rem;
    width: 3rem;
}

#selectItemsConfig .p-checkbox .p-checkbox-box {
    height: 3rem;
    width: 3rem;
}

#selectItemsConfig .p-checkbox .p-checkbox-box .p-checkbox-icon.p-icon {
    height: 2rem;
    width: 2rem;
}
</style>
