<template>
    <div v-if="debugState.debugFlag">
        <div class="flex gap-1">
            <div class="flex gap-1">
                <Button label="Debug:LoadAll" @click="debugLoadAll" />
                <Button label="Debug:LoadDummy" @click="debugLoadDummy" />
            </div>
            <div class="flex flex-column gap-1">
                <div class="flex gap-1">
                    <Checkbox v-model="sandboxMode" :binary="true" />
                    Sandbox Mode
                </div>
                <div class="flex gap-1">
                    <Checkbox v-model="skipFilter" :binary="true" />
                    Disable Filter Requirements
                </div>
                <div class="flex gap-1">
                    <Checkbox v-model="refreshData" :binary="true" />
                    Enable refresh on select
                </div>
            </div>
        </div>
        <div>
            Preload: {{ preloadData.length }} Result: {{ searchResult.length }} Filtered: {{ filteredList.length }} Paged:
            {{ pagedList.length }}
        </div>
        <div>
            <Textarea :model-value="getDebugOutput()" class="h-12rem w-full" />
        </div>
    </div>
</template>

<script setup>
import { ref, reactive, computed } from "vue";
import Button from "primevue/button";
import Checkbox from "primevue/checkbox";
import Textarea from "primevue/textarea";

import { globalState } from "@/components/global";
import { debugState } from "@/components/debug";

import { getAllAttendees } from "@/composables/searchAttendees";
import { getDummyData } from "@/composables/getDummyData";

async function debugLoadAll() {
    searchResult.value = await getAllAttendees(globalState, null);
}

async function debugLoadDummy() {
    searchResult.value = getDummyData();
}

function getDebugOutput() {
    const filteredListStr = JSON.stringify(filteredList.value);
    const filtersStr = JSON.stringify(filters.value);
    const globalSearchStr = JSON.stringify(globalSearchColumns);
    return `testFilter(
        ${filteredListStr}
        ${filtersStr}
        ${globalSearchStr}
        );`;
}

debugState["RegDeskDebug"] = reactive({
    filter: computed({
        get: () => {
            var result = {};
            for (const [key, value] of Object.entries(filters.value)) {
                result[key] = `${value.matchMode} ${value.value}`;
            }
            return result;
        },
    }),
});

// eslint-disable-next-line no-undef
const filters = defineModel("filters");
// eslint-disable-next-line no-undef
const searchResult = defineModel("searchResult");
// eslint-disable-next-line no-undef
const preloadData = defineModel("preloadData");
// eslint-disable-next-line no-undef
const filteredList = defineModel("filteredList");
// eslint-disable-next-line no-undef
const pagedList = defineModel("pagedList");
// eslint-disable-next-line no-undef
const sandboxMode = defineModel("sandboxMode");
// eslint-disable-next-line no-undef
const skipFilter = defineModel("skipFilter");
// eslint-disable-next-line no-undef
const globalSearchColumns = defineModel("globalSearchColumns");
// eslint-disable-next-line no-undef
const refreshData = defineModel("refreshData");
</script>
