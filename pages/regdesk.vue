<!-- eslint-disable vue/multi-word-component-names -->
<template>
    <OnsitePageBase
        :title="`Registration Desk ${sandboxMode ? '- SANDBOX MODE' : ''}`"
        help="Use 'Escape' to reset filters and exit the checkin dialog."
    >
        <StatisticsDialog
            v-if="showStatistics"
            v-model:visible="showStatistics"
            :searchResult="searchResult"
            :filters="filters"
            :globalSearchColumns="globalSearchColumns"
        />
        <div v-if="searchOptions.displayType === 'dialog'">
            <Dialog
                :visible="attendeeInfoSelected !== null"
                @update:visible="onDialogClose"
                modal
                :dismissableMask="true"
                :closeOnEscape="false"
                :maximizable="true"
                header="Checkin Dialog"
                :style="{ width: '80vw' }"
            >
                <RegDeskCheckin v-model="attendeeInfoSelected" @checkin="doCheckin" :refreshData="refreshData" />
            </Dialog>
        </div>
        <div v-if="searchOptions.displayType === 'above' && attendeeInfoSelected !== null" class="pt-1">
            <RegDeskCheckin v-model="attendeeInfoSelected" @checkin="doCheckin" :refreshData="refreshData" />
        </div>
        <SearchTableElement
            ref="attendeeTable"
            v-model="pagedList"
            v-model:selected="attendeeInfoSelected"
            v-model:autoCompleteData="preloadData"
            v-model:loading="loading"
            v-model:totalRecords="totalRecords"
            v-model:filters="filters"
            v-model:sortOrder="storedSortOrder.sortOrder"
            v-model:globalSearchColumns="globalSearchColumns"
            :searchOptions="searchOptions"
            :displayRowsPerPage="searchOptions.displayRowsPerPage"
            @refresh="doRefresh"
            @checkin="doCheckin"
            @page="onPage"
            @unselect="onTableUnSelect"
            :canResetFilter="canResetFilter(filters, storedFilters)"
        >
            <div class="flex justify-content-end gap-1">
                <span class="p-input-icon-left" v-if="globalSearchColumns.length > 0">
                    <i class="pi pi-search" />
                    <InputText ref="globalInput" v-model="filters.global.value" placeholder="Global Search" autofocus />
                </span>
                <div v-if="searchOptions.queryMode === 'manual'">
                    <Button icon="pi pi-search" v-tooltip.bottom="'Search for attendee'" @click="doRefresh" :disabled="!hasMinimalFilter(filters)" />
                </div>
                <Button
                    icon="pi pi-filter-slash"
                    v-tooltip.bottom="'Reset search (globals filters will be unchanged)'"
                    @click="resetFilters(filters, storedFilters)"
                    :disabled="!canResetFilter"
                />
            </div>
            <div class="flex justify-content-end gap-1">
                <div v-if="searchOptions.queryMode === 'preload'" class="flex align-items-end gap-1">
                    <small v-if="getPreloadText() !== null">
                        {{ getPreloadText() }}
                    </small>
                    <Button icon="pi pi-refresh" v-tooltip.bottom="'Refresh preloaded data'" @click="doRefresh" />
                    <Button icon="pi pi-chart-line" v-tooltip.bottom="'Show statistics'" @click="showStatistics = true" />
                </div>
                <div v-if="searchOptions.queryMode === 'ondemand'">
                    <Button icon="pi pi-refresh" v-tooltip.bottom="'Refresh search results'" @click="doRefresh" />
                </div>
                <SearchOptionsDialog v-model:filters="filters" v-model:searchOptions="searchOptions" />
            </div>
        </SearchTableElement>
        <div v-if="searchOptions.displayType === 'below' && attendeeInfoSelected !== null" class="pt-1">
            <RegDeskCheckin v-model="attendeeInfoSelected" @checkin="doCheckin" :refreshData="refreshData" />
        </div>
        <RegDebugPanel
            :globalSearchColumns="globalSearchColumns"
            v-model:filters="filters"
            v-model:skipFilter="skipFilter"
            v-model:searchResult="searchResult"
            v-model:refreshData="refreshData"
            :preloadData="preloadData"
            :filteredList="filteredList"
            :pagedList="pagedList"
            v-model:sandboxMode="sandboxMode"
            :attendeeInfoSelected="attendeeInfoSelected"
        />
    </OnsitePageBase>
</template>

<script setup>
import { ref, watch, computed, reactive } from "vue";
import { useToast } from "primevue/usetoast";
import { useConfirm } from "primevue/useconfirm";

import { globalState } from "@/components/global";

import Dialog from "primevue/dialog";
import InputText from "primevue/inputtext";
import Button from "primevue/button";

import { setupKeyEvents } from "@/composables/setupKeyEvents";
import { checkinAttendee } from "@/composables/apiAttendeeCheckin";
import { useCookieStruct } from "@/composables/useCookieStruct";
import { transformAttendee } from "@/composables/transformAttendee";
import { sortAttendees } from "@/composables/sortAttendees";
import { hasSearchStateChanged, updateSearchState } from "@/composables/searchState";
import { getAllAttendeesForFilter, getAllAttendees } from "@/composables/searchAttendees";
import { cachedGetAllAttendeesForFilter } from "@/composables/searchCache";
import { filterAttendees, hasMinimalFilter } from "@/composables/filterAttendees";
import { useFilter, resetFilters, canResetFilter } from "@/composables/useFilters";
import { confirmDeselect } from "@/composables/confirmDeselection";
import { scheduleRegularTask } from "@/composables/scheduleRegularTask";

import OnsitePageBase from "@/components/OnsitePageBase.vue";
import RegDeskCheckin from "@/components/panels/RegDeskCheckin.vue";
import RegDebugPanel from "@/components/panels/RegDebugPanel.vue";
import SearchTableElement from "@/components/element/SearchTableElement.vue";
import SearchOptionsDialog from "@/components/dialog/SearchOptionsDialog.vue";
import StatisticsDialog from "@/components/dialog/StatisticsDialog.vue";

import { configFilterCookie, configSearchCookie, configSortOrderCookie, configRegdeskSponsorItems } from "@/ef.config";

const attendeeTable = ref(null);
const refreshData = ref(true);

const toast = useToast();
const confirm = useConfirm();

//////////////////////////////////////////////////////
// Loading state
//////////////////////////////////////////////////////

const loading = ref(false);

async function withLoadingAfterSomeTime(fun) {
    const timeoutHandle = setTimeout(() => {
        loading.value = true;
    }, 100);
    const result = await fun();
    clearTimeout(timeoutHandle);
    loading.value = false;
    return result;
}

//////////////////////////////////////////////////////
// Logout handling
//////////////////////////////////////////////////////

const showStatistics = ref(false);

//////////////////////////////////////////////////////
// Logout handling
//////////////////////////////////////////////////////

// Wipe local data in case of a logout
watch(
    () => globalState.isLoggedIn,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    (newState, oldState) => {
        if (!newState) {
            pageStart.value = 0;
            doRefresh();
        }
    },
);

//////////////////////////////////////////////////////
// Selection Tracking
//////////////////////////////////////////////////////

const attendeeInfoSelected = ref(null);

globalState.dirtyTracker.isDirtyState = computed({
    get: () => attendeeInfoSelected.value && attendeeInfoSelected.value.status != "checked in",
});

const activeConfirm = ref(false);

function doConfirmUnSelect() {
    confirmDeselect(confirm, attendeeInfoSelected, activeConfirm);
    activeConfirm.value = false;
}

//////////////////////////////////////////////////////
// Filter state
//////////////////////////////////////////////////////

const storedFilters = useCookieStruct("regdeskFilters", configFilterCookie);

const filters = useFilter(storedFilters.value);
const skipFilter = ref(false);

function checkMinimalFilter() {
    return skipFilter.value || hasMinimalFilter(filters.value);
}

//////////////////////////////////////////////////////
// Attendee Search - State
//////////////////////////////////////////////////////

const searchResult = ref([]);
const searchOptions = useCookieStruct("searchOptions", configSearchCookie);

const globalSearchColumns = computed({
    get: () => searchOptions.value.globalSearchColumns || configSearchCookie.globalSearchColumns,
    set: (value) => {
        searchOptions.value.globalSearchColumns = value;
    },
});

//////////////////////////////////////////////////////
// Attendee Search - Preload
//////////////////////////////////////////////////////

const preloadData = ref([]);
const preloadTime = ref(null);

function getPreloadText() {
    if (preloadTime.value !== null) {
        return `Last update: ${preloadTime.value?.toLocaleTimeString()}`;
    }
    return null;
}

async function updatePreloadData(mode) {
    if (!globalState.isLoggedIn) {
        preloadData.value = [];
        preloadTime.value = null;
        searchResult.value = [];
        return;
    }
    if (searchOptions.value.queryMode === "preload") {
        console.info(`${mode} cache...`);
        if (mode === "Updating") {
            preloadData.value = await getAllAttendees(globalState, null);
        } else {
            await withLoadingAfterSomeTime(async () => {
                preloadData.value = await getAllAttendees(globalState, null);
            });
        }
        searchResult.value = preloadData.value;
        preloadTime.value = new Date();
        if (mode !== "Updating") {
            toast.add({
                group: "global",
                severity: "info",
                summary: `Cached ${preloadData.value.length} attendees`,
                life: 1000,
            });
        }
    }
}
scheduleRegularTask(() => updatePreloadData("Updating"), 1000 * 60 * 5, 1000 * 60);

watch(
    () => attendeeTable.value,
    () => {
        attendeeTable.value?.focusGlobalInput();
    },
);

//////////////////////////////////////////////////////
// Attendee Search - Manual
//////////////////////////////////////////////////////

async function doManualQuery() {
    if (!globalState.isLoggedIn) {
        searchResult.value = [];
        return;
    }
    if (searchOptions.value.queryMode === "manual" && checkMinimalFilter()) {
        await withLoadingAfterSomeTime(async () => {
            searchResult.value = await getAllAttendeesForFilter(
                globalState,
                toast,
                filters.value,
                globalSearchColumns.value,
                storedSortOrder.value.sortOrder,
            );
        });
        if (searchResult.value.length === 0) {
            toast.add({
                group: "global",
                severity: "warn",
                summary: "Search did not yield any results!",
                life: 1000,
            });
        }
    }
}

async function onManualFilterChange() {
    if (searchOptions.value.queryMode === "manual") {
        searchResult.value = [];
    }
}
watch(() => JSON.stringify(filters.value), onManualFilterChange);

//////////////////////////////////////////////////////
// Attendee Search - On Demand
//////////////////////////////////////////////////////

const ondemandSearchState = ref(null);
const ondemandQueryCache = ref({});
scheduleRegularTask(() => (ondemandQueryCache.value = {}), 1000 * 60 * 8, 1000 * 60);

function checkIfQueryRequired(mode, filterValue, searchState) {
    if (mode === "force_query") {
        return true;
    }
    return hasSearchStateChanged(filterValue, searchState.value);
}

async function onDemandSearch(mode) {
    if (!globalState.isLoggedIn) {
        ondemandSearchState.value = null;
        ondemandQueryCache.value = {};
        searchResult.value = [];
        return;
    }
    const filterDict = filters.value;
    if (searchOptions.value.queryMode === "ondemand") {
        if (!checkMinimalFilter()) {
            return;
        }
        await withLoadingAfterSomeTime(async () => {
            if (checkIfQueryRequired(mode, filterDict, ondemandSearchState)) {
                searchResult.value = await cachedGetAllAttendeesForFilter(
                    mode,
                    ondemandQueryCache,
                    globalState,
                    toast,
                    filterDict,
                    globalSearchColumns.value,
                    storedSortOrder.value.sortOrder,
                );
                ondemandSearchState.value = updateSearchState(filterDict);
            }
        });
    }
}
watch(
    () => JSON.stringify(filters.value),
    async () => await onDemandSearch("default"),
);

//////////////////////////////////////////////////////
// Attendee Search - Common
//////////////////////////////////////////////////////

async function doRefresh() {
    const queryMode = searchOptions.value.queryMode;
    if (queryMode == "preload") {
        await updatePreloadData("Forced refresh");
    }
    if (!checkMinimalFilter()) {
        return;
    }
    if (queryMode == "ondemand") {
        await onDemandSearch("force_query");
    }
    if (queryMode == "manual") {
        await doManualQuery();
    }
}
watch(() => attendeeTable.value, doRefresh);
watch(() => searchOptions.value.queryMode, doRefresh);

//////////////////////////////////////////////////////
// Attendee Filtering
//////////////////////////////////////////////////////

const filteredList = computed({
    get: () => {
        if (attendeeTable.value === null) {
            return [];
        }
        const transformedResults = searchResult.value.map((item) => transformAttendee(item, configRegdeskSponsorItems));
        if (searchOptions.value.queryMode === "manual") {
            return transformedResults;
        }
        const filterDict = filters.value;
        if (checkMinimalFilter()) {
            return filterAttendees(transformedResults, filterDict, globalSearchColumns.value);
        } else {
            return [];
        }
    },
});

const totalRecords = computed({
    get: () => filteredList.value.length,
});

//////////////////////////////////////////////////////
// Attendee Filtering
//////////////////////////////////////////////////////

const lastAutoSelect = ref(null);

async function onTotalRecordsChange() {
    // Auto-select logic
    if (searchOptions.value.autoSelect !== true) {
        return;
    }
    if (filteredList.value.length !== 1) {
        return;
    }
    if (filteredList.value[0].id === lastAutoSelect.value) {
        return;
    }
    attendeeInfoSelected.value = filteredList.value[0];
    lastAutoSelect.value = attendeeInfoSelected.value.id;
}
watch(() => totalRecords.value, onTotalRecordsChange);

//////////////////////////////////////////////////////
// Attendee Sorting
//////////////////////////////////////////////////////

const storedSortOrder = useCookieStruct("regdeskSortOrder", configSortOrderCookie);

const sortedList = computed({
    get: () => {
        return sortAttendees(filteredList, storedSortOrder.value.sortOrder);
    },
});

//////////////////////////////////////////////////////
// Attendee Paging
//////////////////////////////////////////////////////

const pageStart = ref(0);
const pageSize = ref(null);

const pagedList = computed({
    get: () => {
        const localPageSize = pageSize.value || searchOptions.value.displayRowsPerPage;
        return sortedList.value.slice(pageStart.value, pageStart.value + localPageSize);
    },
});

async function onPage(event) {
    pageStart.value = event.first;
    pageSize.value = event.rows;
}

async function resetPageIfNeeded() {
    if (sortedList.value.length > 0 && pagedList.value.length === 0) {
        pageStart.value = 0;
    }
}
watch(() => pagedList.value.length, resetPageIfNeeded);
watch(() => sortedList.value.length, resetPageIfNeeded);

//////////////////////////////////////////////////////
// Dialog Status Tracking
//////////////////////////////////////////////////////

function onDialogClose() {
    doConfirmUnSelect();
}

function onTableUnSelect(event) {
    // User deselected row on the table, attendeeInfoSelected is already null
    attendeeInfoSelected.value = event.data; // Restore selection from event data
    doConfirmUnSelect(); // Deselect if user confirms
}

//////////////////////////////////////////////////////
// Keyboard Shortcuts
//////////////////////////////////////////////////////

function onEscape() {
    if (activeConfirm.value === true) {
        // Confirmation dialog is still open - do nothing
        return;
    } else if (attendeeInfoSelected.value !== null) {
        // Attendee is selected
        doConfirmUnSelect();
    } else {
        // Reset filters
        resetFilters(filters.value, storedFilters.value);
        attendeeTable.value?.focusGlobalInput();
    }
}

setupKeyEvents("keydown", (key) => key === "escape", onEscape);

//////////////////////////////////////////////////////
// Checkin Function
//////////////////////////////////////////////////////

const sandboxMode = ref(true);

async function doCheckin(regId) {
    function updateState() {
        const affectedAttendee = pagedList.value.find((element) => element.id == regId);
        if (affectedAttendee?.status !== "checked in") {
            affectedAttendee.status = "checked in";
        } else {
            toast.add({
                group: "global",
                severity: "error",
                summary: "Unable to set status in the local state",
                life: 500,
            });
        }
    }
    if (sandboxMode.value) {
        alert("SANDBOX MODE: This will only set the local state!");
        updateState();
    } else {
        if (await checkinAttendee(globalState, toast, regId)) {
            updateState();
        }
    }
}

//////////////////////////////////////////////////////
// Debugging
//////////////////////////////////////////////////////

import { debugState } from "@/components/debug";
debugState["RegDeskDebug"] = reactive({
    selected: attendeeInfoSelected.value,
});
</script>
