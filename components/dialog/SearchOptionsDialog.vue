<template>
    <Dialog v-model:visible="isSearchOptionVisible" modal header="Search Configuration" :style="{ width: '50vw' }">
        <TabView>
            <TabPanel header="UI Settings">
                <div class="flex flex-column gap-2">
                    <div class="flex flex-column gap-1">
                        <label for="displayRowsPerPage">Number of results per page</label>
                        <Dropdown id="displayRowsPerPage" v-model="searchOptions.displayRowsPerPage" :options="[1, 2, 5, 10, 20, 50, 100, 10000]" />
                    </div>
                    <div class="flex flex-column gap-1">
                        <label for="displayType">How the check-in is shown</label>
                        <SelectButton
                            id="displayType"
                            v-model="searchOptions.displayType"
                            :options="configDisplayTypeItems"
                            optionLabel="label"
                            optionValue="value"
                        />
                    </div>
                    <div class="flex flex-column gap-1">
                        <label for="filterDisplay">Layout of the filter elements</label>
                        <SelectButton
                            id="filterDisplay"
                            v-model="searchOptions.filterDisplay"
                            :options="configFilterDisplayItems"
                            optionLabel="label"
                            optionValue="value"
                        />
                    </div>
                    <div class="flex flex-column gap-1">
                        <label for="autoSelect">Auto-select if there is just one match</label>
                        <InputSwitch id="autoSelect" v-model="searchOptions.autoSelect" />
                    </div>
                    <div class="flex flex-column gap-1">
                        <label for="queryMode">Attendee query settings</label>
                        <SelectButton
                            id="queryMode"
                            v-model="localQueryMode"
                            :options="configQueryModeItems"
                            optionLabel="label"
                            optionValue="value"
                        />
                    </div>
                </div>
            </TabPanel>

            <TabPanel header="Column Settings">
                <div class="flex flex-rows gap-2 w-full">
                    <div class="flex flex-column gap-1 w-6">
                        <label for="activeColumns">Active columns</label>
                        <Listbox
                            id="activeColumns"
                            v-model="searchOptions.activeColumns"
                            :options="columnOptions"
                            optionLabel="label"
                            optionValue="column"
                            multiple
                        />
                    </div>
                    <div class="flex flex-column gap-1 w-6">
                        <label for="globalSearchColumns">Global search columns</label>
                        <Listbox
                            id="globalSearchColumns"
                            v-model="searchOptions.globalSearchColumns"
                            :options="possibleGlobalSearchColumns"
                            optionLabel="label"
                            optionValue="column"
                            multiple
                        />
                    </div>
                </div>
            </TabPanel>

            <TabPanel header="Global Filter Settings">
                <div class="flex flex-column gap-2">
                    <div class="flex flex-column gap-1">
                        <label for="country">Country Filter</label>
                        <CountrySearchElement id="country" v-model="filters.country.value" :filterCallback="() => {}" />
                    </div>
                    <div class="flex flex-column gap-1">
                        <label for="status">Status Filter</label>
                        <TagSearchElement
                            id="status"
                            v-model="filters.status.value"
                            :filterCallback="() => {}"
                            :configItems="configStatusItems"
                            :maxSelectedLabels="5"
                        />
                    </div>
                    <div class="flex flex-column gap-1">
                        <label for="roles">Role Filter</label>
                        <TagSearchElement
                            id="roles"
                            v-model="filters.roles.value"
                            :filterCallback="() => {}"
                            :configItems="configRoleItems"
                            :maxSelectedLabels="5"
                        />
                    </div>
                    <div class="flex flex-column gap-1">
                        <label for="sponsor">Sponsor Level Filter</label>
                        <TagSearchElement
                            id="sponsor"
                            v-model="filters.sponsor.value"
                            :filterCallback="() => {}"
                            :configItems="configRegdeskSponsorItems"
                            :maxSelectedLabels="5"
                        />
                    </div>
                </div>
            </TabPanel>
        </TabView>
    </Dialog>
    <Button icon="pi pi-cog" @click="isSearchOptionVisible = true" outlined v-tooltip.bottom="'Search options'" />
</template>

<script setup>
import { ref, computed } from "vue";

import TabView from "primevue/tabview";
import TabPanel from "primevue/tabpanel";
import Button from "primevue/button";
import Dialog from "primevue/dialog";
import Listbox from "primevue/listbox";
import SelectButton from "primevue/selectbutton";
import Dropdown from "primevue/dropdown";
import InputSwitch from "primevue/inputswitch";

import {
    configSearchCookie,
    configColumnItems,
    configStatusItems,
    configRegdeskSponsorItems,
    configRoleItems,
    possibleGlobalSearchColumns,
} from "@/ef.config";

import TagSearchElement from "@/components/element/table/TagSearchElement.vue";
import CountrySearchElement from "@/components/element/table/CountrySearchElement.vue";

const isSearchOptionVisible = ref(false);

const configFilterDisplayItems = [
    {
        value: "menu",
        label: "Search Menus",
    },
    {
        value: "row",
        label: "Search Row",
    },
];

const configDisplayTypeItems = [
    {
        value: "dialog",
        label: "Modal Dialog",
    },
    {
        value: "above",
        label: "Above Search Results",
    },
    {
        value: "below",
        label: "Under Search Results",
    },
];

const configQueryModeItems = [
    {
        value: "preload",
        label: "Preload Data (enables Auto-Complete)",
    },
    {
        value: "ondemand",
        label: "Automatic Search (with Caching)",
    },
    {
        value: "manual",
        label: "Search Button (no Caching)",
    },
];

const columnOptions = configColumnItems.concat([
    {
        column: "checkin",
        label: "Checkin",
    },
]);

// eslint-disable-next-line no-undef
const filters = defineModel("filters");
// eslint-disable-next-line no-undef
const searchOptions = defineModel("searchOptions");

const localQueryMode = computed({
    get: () => searchOptions.value.queryMode,
    set: (value) => {
        searchOptions.value.queryMode = value || configSearchCookie.queryMode;
    },
});
</script>

<style>
.p-listbox .p-listbox-list .p-listbox-item.p-highlight {
    background: var(--primary-300);
    color: white;
}

.p-listbox .p-listbox-list .p-listbox-item.p-highlight {
    background: var(--primary-300);
    color: white;
}

.p-listbox:not(.p-disabled) .p-listbox-item.p-highlight.p-focus {
    background: var(--primary-200);
}
</style>
