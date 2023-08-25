<template>
    <DataTable
        v-model:value="modelValue"
        tableStyle="min-width: 50rem"
        v-model:selection="attendeeSelected"
        v-model:multiSortMeta="sortOrder"
        selectionMode="single"
        dataKey="badge_id"
        :metaKeySelection="false"
        v-model:loading="loading"
        sortMode="multiple"
        :removableSort="true"
        :reorderableColumns="true"
        :resizableColumns="true"
        stripedRows
        :rows="displayRowsPerPage"
        :filterDisplay="searchOptions.filterDisplay"
        :globalFilterFields="globalSearchColumns"
        v-model:filters="filters"
        lazy
        paginator
        @page="$emit('page', $event)"
        @sort="$emit('sort', $event)"
        @filter="$emit('filter', $event)"
        :totalRecords="totalRecords"
        currentPageReportTemplate="Showing {first} to {last} of {totalRecords}"
        paginatorTemplate="FirstPageLink PrevPageLink PageLinks JumpToPageDropdown NextPageLink LastPageLink CurrentPageReport"
    >
        <template #header>
            <div class="flex justify-content-between flex-wrap">
                <slot></slot>
            </div>
        </template>

        <template #empty>
            <div v-if="!hasMinimalFilter(filters)">
                <SearchTableMessage severity="info" title="Please enter search criteria!">
                    <ul>
                        <li>
                            Enter some number in the <span v-if="globalSearchColumns.includes('badge_id')">global or</span> 'Badge ID' search field
                        </li>
                        <li>
                            Enter at least two characters in <span v-if="getGlobalFilterNameItems().length > 0">the global or</span> any column search
                            fields
                        </li>
                    </ul>
                </SearchTableMessage>
                <SearchTableMessage severity="info" title="Use the 'Global Search' to search for" v-if="globalSearchColumns?.length > 0">
                    <ul>
                        <li v-if="globalSearchColumns.includes('badge_id')">'Badge ID' with or without the checksum letter</li>
                        <li v-if="getGlobalFilterNameItems().length > 0">
                            {{
                                getGlobalFilterNameItems()
                                    .map((item) => `'${item.label}'`)
                                    .join(", ")
                            }}<span
                                v-if="
                                    getGlobalFilterNameItems().filter((item) => item.column === 'first_name').length > 0 &&
                                    getGlobalFilterNameItems().filter((item) => item.column === 'last_name').length > 0
                                "
                                >, or the 'Full Name'</span
                            >
                            that is non-numeric
                        </li>
                        <li v-if="globalSearchColumns.includes('birthday')">'Birthday' using the yyyy-mm-dd format and entering at least 'yyyy-'</li>
                    </ul>
                </SearchTableMessage>
                <SearchTableMessage severity="info" title="Auto-Selection of attendees is done when" v-if="searchOptions.autoSelect">
                    <ul class="search-help-list">
                        <li>the filtered search result contains only a single attendee,</li>
                        <li v-if="globalSearchColumns.includes('badge_id')">and the global filter is not a number,</li>
                        <li>and the user was not previously selected by the Auto-Selection mechanism.</li>
                    </ul>
                </SearchTableMessage>
            </div>
            <div v-else-if="hasActiveFilter(filters)">
                <div v-if="searchOptions.queryMode !== 'manual'">
                    <Message class="max-w-screen" severity="info" :closable="false"
                        >No attendees are matching the current filters!
                        <pre>{{ getFilterText(filters) }}</pre>
                    </Message>
                </div>
                <div v-else>
                    <Message class="max-w-screen" severity="info" :closable="false"
                        >Please press the search button to search for:
                        <pre>{{ getFilterText(filters) }}</pre>
                    </Message>
                </div>
            </div>
            <div v-else>
                <Message severity="info" :closable="false">No attendees were retrieved from the database!</Message>
            </div>
        </template>

        <template #loading> Loading attendee data. Please wait. </template>

        <Column
            sortable
            v-if="searchOptions.activeColumns.includes('badge_id')"
            field="badge_id"
            header="Badge ID"
            :showFilterMatchModes="getShowFilterMatchMenu('string')"
            :showFilterMenu="getShowFilterMenu('string')"
        >
            <template #filter="{ filterModel, filterCallback }">
                <StandardSearchElement
                    v-model="filterModel.value"
                    :filterCallback="filterCallback"
                    :autoCompleteData="autoCompleteData"
                    autoCompleteField="badge_id"
                    placeholder="Search by ID"
                />
            </template>
        </Column>

        <Column
            sortable
            v-if="searchOptions.activeColumns.includes('nickname')"
            field="nickname"
            header="Nickname"
            :showFilterMatchModes="getShowFilterMatchMenu('string')"
            :showFilterMenu="getShowFilterMenu('string')"
        >
            <template #filter="{ filterModel, filterCallback }">
                <StandardSearchElement
                    v-model="filterModel.value"
                    :filterCallback="filterCallback"
                    :autoCompleteData="autoCompleteData"
                    autoCompleteField="nickname"
                    placeholder="Search by nickname"
                />
            </template>
            <template #body="{ data }">
                <TruncatedColumnElement :maxLength="20" :modelValue="data.nickname" />
            </template>
        </Column>

        <Column
            sortable
            v-if="searchOptions.activeColumns.includes('first_name')"
            field="first_name"
            header="First Name"
            :showFilterMatchModes="getShowFilterMatchMenu('string')"
            :showFilterMenu="getShowFilterMenu('string')"
        >
            <template #filter="{ filterModel, filterCallback }">
                <StandardSearchElement
                    v-model="filterModel.value"
                    :filterCallback="filterCallback"
                    :autoCompleteData="autoCompleteData"
                    autoCompleteField="first_name"
                    placeholder="Search by first name"
                />
            </template>
            <template #body="{ data }">
                <TruncatedColumnElement :maxLength="20" :modelValue="data.first_name" />
            </template>
        </Column>

        <Column
            sortable
            v-if="searchOptions.activeColumns.includes('last_name')"
            field="last_name"
            header="Last Name"
            :showFilterMatchModes="getShowFilterMatchMenu('string')"
            :showFilterMenu="getShowFilterMenu('string')"
        >
            <template #filter="{ filterModel, filterCallback }">
                <StandardSearchElement
                    v-model="filterModel.value"
                    :filterCallback="filterCallback"
                    :autoCompleteData="autoCompleteData"
                    autoCompleteField="last_name"
                    placeholder="Search by last name"
                />
            </template>
            <template #body="{ data }">
                <TruncatedColumnElement :maxLength="20" :modelValue="data.last_name" />
            </template>
        </Column>

        <Column
            sortable
            v-if="searchOptions.activeColumns.includes('country')"
            field="country"
            header="Country"
            dataType="enum"
            :showFilterMatchModes="getShowFilterMatchMenu('enum')"
            :showFilterMenu="getShowFilterMenu('enum')"
        >
            <template #filter="{ filterModel, filterCallback }">
                <CountrySearchElement v-model="filterModel.value" :filterCallback="filterCallback" />
            </template>
            <template #body="{ data }">
                <CountryColumnElement :modelValue="data.country" />
            </template>
        </Column>

        <Column
            sortable
            v-if="searchOptions.activeColumns.includes('birthday')"
            field="birthday"
            header="Birthday"
            dataType="date"
            :showFilterMatchModes="getShowFilterMatchMenu('date')"
            :showFilterMenu="getShowFilterMenu('date')"
        >
            <template #filter="{ filterModel, filterCallback }">
                <BirthdaySearchElement v-model="filterModel.value" :filterCallback="filterCallback" />
            </template>
            <template #body="{ data }">
                <BirthdayColumnElement :modelValue="data.birthday" />
            </template>
        </Column>

        <Column
            sortable
            v-if="searchOptions.activeColumns.includes('status')"
            field="status"
            header="Status"
            dataType="enum"
            :showFilterMatchModes="getShowFilterMatchMenu('enum')"
            :showFilterMenu="getShowFilterMenu('enum')"
        >
            <template #filter="{ filterModel, filterCallback }">
                <TagSearchElement v-model="filterModel.value" :filterCallback="filterCallback" :configItems="configStatusItems" />
            </template>
            <template #body="{ data }">
                <TagElement :model-value="data.status" :configItems="configStatusItems" />
            </template>
        </Column>

        <Column
            sortable
            v-if="searchOptions.activeColumns.includes('conbook')"
            field="conbook"
            header="Conbook"
            dataType="enum"
            :showFilterMatchModes="getShowFilterMatchMenu('enum')"
            :showFilterMenu="getShowFilterMenu('enum')"
        >
            <template #filter="{ filterModel, filterCallback }">
                <TagSearchElement v-model="filterModel.value" :filterCallback="filterCallback" :configItems="configConbookItems" />
            </template>
            <template #body="{ data }">
                <TagElement v-if="data.conbook" :model-value="data.conbook" :configItems="configConbookItems" />
            </template>
        </Column>

        <Column
            sortable
            v-if="searchOptions.activeColumns.includes('sponsor')"
            filterField="sponsor"
            sortField="sponsor"
            columnKey="sponsor"
            header="Sponsor"
            dataType="enum"
            :showFilterMatchModes="getShowFilterMatchMenu('enum')"
            :showFilterMenu="getShowFilterMenu('enum')"
        >
            <template #filter="{ filterModel, filterCallback }">
                <TagSearchElement v-model="filterModel.value" :filterCallback="filterCallback" :configItems="configRegdeskSponsorItems" />
            </template>
            <template #body="{ data }">
                <TagElement :model-value="useSponsor(toRef(data), configRegdeskSponsorItems)" :configItems="configRegdeskSponsorItems" />
            </template>
        </Column>

        <Column
            sortable
            v-if="searchOptions.activeColumns.includes('roles')"
            filterField="roles"
            sortField="roles"
            columnKey="roles"
            header="Roles"
            dataType="enum"
            :showFilterMatchModes="getShowFilterMatchMenu('enum')"
            :showFilterMenu="getShowFilterMenu('enum')"
        >
            <template #filter="{ filterModel, filterCallback }">
                <TagSearchElement v-model="filterModel.value" :filterCallback="filterCallback" :configItems="configRoleItems" />
            </template>
            <template #body="{ data }">
                <div class="flex flex-wrap gap-1">
                    <div :key="role" v-for="role in useRoles(toRef(data)).value">
                        <TagElement :model-value="role" :configItems="configRoleItems" />
                    </div>
                </div>
            </template>
        </Column>

        <Column v-if="searchOptions.activeColumns.includes('checkin')" columnKey="checkin" header="Checkin">
            <template #body="{ data }">
                <div v-if="canCheckin(data)">
                    <Button label="Checkin" class="h-2rem w-7rem" :disabled="data.status !== 'paid'" @click="$emit('checkin', data.id)" />
                </div>
                <div v-else class="h-2rem w-7rem"></div>
            </template>
        </Column>

        <Column sortable v-if="searchOptions.activeColumns.includes('current_dues')" field="current_dues" header="Dues" dataType="numeric">
            <template #body="{ data }">
                <DuesColumnElement :modelValue="data.current_dues" />
            </template>
        </Column>
    </DataTable>
</template>

<script setup>
import { toRef } from "vue";
import { FilterMatchMode } from "primevue/api";
import { usePrimeVue } from "primevue/config";

import DataTable from "primevue/datatable";
import Column from "primevue/column";
import Message from "primevue/message";

import { hasActiveFilter, getFilterText } from "@/composables/useFilters";
import { useRoles } from "@/composables/fields/useRoles";
import { useSponsor } from "@/composables/fields/useSponsor";
import { hasMinimalFilter } from "@/composables/filterAttendees";
import { canCheckin } from "@/composables/canCheckin";

import { configStatusItems, configRoleItems, configRegdeskSponsorItems, configConbookItems, configColumnItems } from "@/ef.config";

import Button from "primevue/button";

import SearchTableMessage from "@/components/element/SearchTableMessage.vue";

import TagElement from "@/components/element/TagElement.vue";
import BirthdayColumnElement from "@/components/element/table/BirthdayColumnElement.vue";
import CountryColumnElement from "@/components/element/table/CountryColumnElement.vue";
import DuesColumnElement from "@/components/element/table/DuesColumnElement.vue";
import TruncatedColumnElement from "@/components/element/table/TruncatedColumnElement.vue";

import StandardSearchElement from "@/components/element/table/StandardSearchElement.vue";
import TagSearchElement from "@/components/element/table/TagSearchElement.vue";
import BirthdaySearchElement from "@/components/element/table/BirthdaySearchElement.vue";
import CountrySearchElement from "@/components/element/table/CountrySearchElement.vue";

const primevue = usePrimeVue();
primevue.config.filterMatchModeOptions.enum = [];
primevue.config.filterMatchModeOptions.list = [FilterMatchMode.CONTAINS, FilterMatchMode.NOT_CONTAINS];

function getGlobalFilterNameItems() {
    return configColumnItems.filter((item) => {
        const isName = ["nickname", "first_name", "last_name"].includes(item.column);
        const isInActiveGlobalFilters = globalSearchColumns.value.includes(item.column);
        return isName && isInActiveGlobalFilters;
    });
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
function getShowFilterMenu(dataType) {
    if (props.searchOptions.filterDisplay !== "row") {
        return true;
    } else {
        return false; //!(['enum', 'date'].includes(dataType));
    }
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
function getShowFilterMatchMenu(dataType) {
    return false; // !(['enum', 'date'].includes(dataType));
}

// eslint-disable-next-line no-undef
const modelValue = defineModel();
// eslint-disable-next-line no-undef
const attendeeSelected = defineModel("selected");
// eslint-disable-next-line no-undef
const loading = defineModel("loading");
// eslint-disable-next-line no-undef
const totalRecords = defineModel("totalRecords");
// eslint-disable-next-line no-undef
const filters = defineModel("filters");
// eslint-disable-next-line no-undef
const autoCompleteData = defineModel("autoCompleteData");
// eslint-disable-next-line no-undef
const globalSearchColumns = defineModel("globalSearchColumns");
// eslint-disable-next-line no-undef
const sortOrder = defineModel("sortOrder");

defineEmits(["checkin", "sort", "page", "filter"]);
const props = defineProps(["searchOptions", "displayRowsPerPage"]);
</script>

<style>
.p-datatable.p-datatable-striped .p-datatable-tbody > tr:nth-child(even).p-highlight {
    background-color: var(--primary-400);
    color: var(--surface-a);
}

.p-datatable.p-datatable-striped .p-datatable-tbody > tr:nth-child(odd).p-highlight {
    background-color: var(--primary-400);
    color: var(--surface-a);
}

.p-column-filter-menu-button.p-column-filter-menu-button-active,
.p-column-filter-menu-button.p-column-filter-menu-button-active:hover {
    background: var(--red-500);
    color: var(--surface-a);
}

.p-column-filter-row .p-column-filter-menu-button,
.p-column-filter-row .p-column-filter-clear-button {
    background: var(--red-500);
    color: var(--surface-a);
}
</style>
