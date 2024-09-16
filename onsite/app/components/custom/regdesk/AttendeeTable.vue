<template>
  <div class="attendee-table">
    <DataTable
      v-model:value="attendeeInfosRef"
      dataKey="badge_id"
      v-model:rows="displayOptionsRef.displayRowsPerPage"
      :totalRecords="dataOptionsRef.totalRecords"
      :paginator="true"
      paginatorTemplate="FirstPageLink PrevPageLink PageLinks JumpToPageDropdown NextPageLink LastPageLink CurrentPageReport"
      currentPageReportTemplate="Showing {first} to {last} of {totalRecords}"
      :lazy="true"
      v-model:loading="dataOptionsRef.loading"
      v-model:multiSortMeta="dataOptionsRef.sortOrder"
      sortMode="multiple"
      :removableSort="true"
      v-model:filters="dataOptionsRef.filters"
      v-model:filterDisplay="displayOptionsRef.filterInputDisplay"
      v-model:globalFilterFields="dataOptionsRef.globalFilterFields"
      v-model:selection="selectedRef"
      selectionMode="single"
      compareSelectionBy="equals"
      :metaKeySelection="false"
      :resizableColumns="true"
      :reorderableColumns="true"
      :stripedRows="true"
      :scrollable="true"
      tableStyle="min-width: 50rem"
      @page="$emit('onPage', $event)"
      @sort="$emit('onSort', $event)"
      @filter="$emit('onFilter', $event)"
    >
      <template #header>
        <div class="flex justify-content-between flex-wrap">
          <slot name="header"></slot>
        </div>
      </template>

      <template #empty>
        <slot name="empty"></slot>
      </template>

      <template #loading> Loading attendee data. Please wait. </template>
      <Column
        v-for="columnDefinition of getActiveColumnDefinitionList(
          displayOptionsRef.displayColumns
        )"
        :sortable="columnDefinition?.sortEnabled || true"
        :field="columnDefinition.fieldName"
        :header="columnDefinition.label"
        :columnKey="columnDefinition.fieldName"
        :sortField="columnDefinition.fieldName"
        :filterField="columnDefinition.fieldName"
        :dataType="columnDefinition?.dataType"
        :showFilterMenu="showFilterMenu(columnDefinition)"
        :showFilterOperator="false"
        :showClearButton="false"
        :showAddButton="false"
      >
        <template #filter="{ filterModel, filterCallback }">
          <div v-if="!filterModel"></div>
          <CustomRegdeskTableSearchFieldBirthday
            v-else-if="columnDefinition?.filterComponentType === 'birthday'"
            v-model="filterModel.value"
            :filterCallback="filterCallback"
          />
          <CustomRegdeskTableSearchFieldCountry
            v-else-if="columnDefinition?.filterComponentType === 'country'"
            v-model="filterModel.value"
            :filterCallback="filterCallback"
            :autoCompleteData="autoCompleteDataRef"
          />
          <CustomRegdeskTableSearchFieldTag
            v-else-if="columnDefinition?.filterComponentType === 'tag'"
            v-model="filterModel.value"
            :filterCallback="filterCallback"
            :configItems="columnDefinition?.configItems || []"
            :autoCompleteData="autoCompleteDataRef"
            :autoCompleteField="columnDefinition.fieldName"
          />
          <CustomRegdeskTableSearchFieldStandard
            v-else-if="columnDefinition?.filterComponentType !== undefined"
            v-model="filterModel.value"
            :filterCallback="filterCallback"
            :autoCompleteData="autoCompleteDataRef"
            :autoCompleteField="columnDefinition.fieldName"
            placeholder="Search"
          />
        </template>
        <template #body="{ data }">
          <span :class="`table-field-${columnDefinition.fieldName}`">
            <CustomRegdeskTableColumnElementCountry
              v-if="columnDefinition.columnComponentType === 'country'"
              :modelValue="data"
            />
            <CustomRegdeskTableColumnElementBirthday
              v-else-if="columnDefinition.columnComponentType === 'birthday'"
              :modelValue="data"
            />
            <CustomTagControl
              v-else-if="columnDefinition.columnComponentType === 'tag'"
              :modelValue="data[columnDefinition.fieldName]"
              :configItems="columnDefinition?.configItems || []"
            />
            <CustomRegdeskTableColumnElementCheckin
              v-else-if="columnDefinition.columnComponentType === 'checkin'"
              :modelValue="data"
            />
            <CustomRegdeskTableColumnElementDues
              v-else-if="columnDefinition.columnComponentType === 'dues'"
              :modelValue="data[columnDefinition.fieldName]"
            />
            <CustomRegdeskTableColumnElementStandard
              v-else
              :modelValue="data[columnDefinition.fieldName]"
              :maxLength="columnDefinition?.maxLength || 0"
            />
          </span>
        </template>
      </Column>
    </DataTable>
  </div>
</template>

<script setup lang="ts">
import { setupColumnDefinitionList } from "@/config/regdesk";
import type {
  AttendeeDataOptions,
  AttendeeTableDisplayOptions,
  ColumnDefinition,
  TransformedAttendeeInfo,
} from "@/types/internal";
import type { ModelRef } from "vue";

function showFilterMenu(columnDefinition: ColumnDefinition): boolean {
  if (columnDefinition.filterComponentType === undefined) {
    return false;
  }
  const result: boolean | undefined = columnDefinition?.showFilterMenu;
  return result === undefined ? true : result;
}

function getActiveColumnDefinitionList(
  displayColumns: (keyof TransformedAttendeeInfo)[]
): ColumnDefinition[] {
  return setupColumnDefinitionList.filter((item) =>
    displayColumns.includes(item.fieldName)
  );
}

const dataOptionsRef: ModelRef<AttendeeDataOptions> =
  defineModel<AttendeeDataOptions>("dataOptions", { required: true });

const selectedRef: ModelRef<TransformedAttendeeInfo | null> =
  defineModel<TransformedAttendeeInfo | null>("selected", { required: true });

watch(
  () => JSON.stringify(selectedRef.value),
  async (value: string | null, oldValue: string | undefined): Promise<void> => {
    if (selectedRef.value?.id === null) {
      selectedRef.value = null;
    }
  },
  { immediate: true }
);

const displayOptionsRef: ModelRef<AttendeeTableDisplayOptions> =
  defineModel<AttendeeTableDisplayOptions>("displayOptions", {
    required: true,
  });

const autoCompleteDataRef: ModelRef<TransformedAttendeeInfo[]> = defineModel<
  TransformedAttendeeInfo[]
>("autoCompleteData", { required: true });

const attendeeInfosRef: ModelRef<TransformedAttendeeInfo[]> = defineModel<
  TransformedAttendeeInfo[]
>({ required: true });

defineEmits(["onSort", "onPage", "onFilter"]);
</script>

<style>
/* Hide N/A Tag for Con Role */
.attendee-table .table-field-transConRole .tag-value- {
  display: none;
}

.attendee-table
  .p-datatable.p-datatable-striped
  .p-datatable-tbody
  > tr.p-row-odd.p-datatable-row-selected {
  background-color: var(--p-primary-500);
}
.attendee-table
  .p-datatable.p-datatable-striped
  .p-datatable-tbody
  > tr.p-row-even.p-datatable-row-selected {
  background-color: var(--p-primary-500);
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
