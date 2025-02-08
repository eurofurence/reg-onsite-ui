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
      v-model:filters="dataOptionsRef.filterConfig.filterValues"
      v-model:filterDisplay="displayOptionsRef.filterInputDisplay"
      v-model:globalFilterFields="
        dataOptionsRef.filterConfig.globalFilterFields
      "
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

      <template #loading>Loading attendee data. Please wait.</template>

      <Column
        v-for="columnDefinition of props.activeColumns"
        :sortable="columnDefinition?.sortEnabled || true"
        :field="columnDefinition.value"
        :header="columnDefinition.label"
        :columnKey="columnDefinition.value"
        :sortField="columnDefinition.value"
        :filterField="columnDefinition.value"
        :dataType="columnDefinition.dataType"
        :showFilterMenu="showFilterMenu(columnDefinition)"
        :showFilterOperator="false"
        :showClearButton="false"
        :showAddButton="false"
      >
        <template #filter="{ filterModel, filterCallback }">
          <div v-if="columnDefinition.filterConfig !== undefined">
            <AttendeeTableSearchFieldBirthday
              v-if="columnDefinition.columnType === ColumnType.birthday"
              v-model="filterModel.value"
              :columnDefinition="columnDefinition"
              :filterCallback="filterCallback"
            />
            <AttendeeTableSearchFieldCountry
              v-else-if="columnDefinition.columnType === ColumnType.country"
              v-model="filterModel.value"
              :columnDefinition="columnDefinition"
              :filterCallback="filterCallback"
              :autoCompleteData="props.autoCompleteData"
            />
            <AttendeeTableSearchFieldTag
              v-else-if="columnDefinition.columnType === ColumnType.tag"
              v-model="filterModel.value"
              :columnDefinition="columnDefinition"
              :filterCallback="filterCallback"
              :configItems="columnDefinition.configItems"
              :autoCompleteData="props.autoCompleteData"
              :autoCompleteField="columnDefinition.value"
            />
            <AttendeeTableSearchFieldStandard
              v-else-if="columnDefinition.columnType === ColumnType.standard"
              v-model="filterModel.value"
              :columnDefinition="columnDefinition"
              :filterCallback="filterCallback"
              :autoCompleteData="props.autoCompleteData"
              :autoCompleteField="columnDefinition.value"
              placeholder="Search"
            />
          </div>
        </template>
        <template #body="{ data }">
          <span :class="`table-field-${columnDefinition.value}`">
            <AttendeeTableColumnElementBirthday
              v-if="columnDefinition.columnType === ColumnType.birthday"
              :modelValue="data"
            />
            <AttendeeTableColumnElementCountry
              v-else-if="columnDefinition.columnType === ColumnType.country"
              :modelValue="data"
            />
            <CustomTagControl
              v-else-if="columnDefinition.columnType === ColumnType.tag"
              :modelValue="data[columnDefinition.value]"
              :configItems="columnDefinition.configItems"
            />
            <AttendeeTableColumnElementCheckin
              v-else-if="columnDefinition.columnType === ColumnType.checkin"
              :modelValue="data"
            />
            <AttendeeTableColumnElementDues
              v-else-if="columnDefinition.columnType === ColumnType.dues"
              :modelValue="data[columnDefinition.value]"
            />
            <AttendeeTableColumnElementStandard
              v-else-if="columnDefinition.columnType === ColumnType.standard"
              :modelValue="data[columnDefinition.value]"
              :maxLength="columnDefinition.maxLength"
            />
          </span>
        </template>
      </Column>
    </DataTable>
  </div>
</template>

<script setup lang="ts">
import type { ModelRef } from "vue";
import {
  ColumnType,
  type ColumnDefinition,
} from "@/types/internal/component/table";
import type { TransformedAttendeeInfo } from "@/types/internal/attendee";
import type {
  AttendeeDataOptions,
  AttendeeTableDisplayOptions,
} from "@/types/internal/system/regdesk";

function showFilterMenu(columnDefinition: ColumnDefinition): boolean {
  if (columnDefinition.filterConfig === undefined) {
    return false;
  }
  return columnDefinition.filterConfig.canChangeMatcher;
}

const dataOptionsRef: ModelRef<AttendeeDataOptions> =
  defineModel<AttendeeDataOptions>("dataOptions", { required: true });

const selectedRef: ModelRef<TransformedAttendeeInfo | null> =
  defineModel<TransformedAttendeeInfo | null>("selected", { required: true });

// Prevent selection of placeholder
watch(
  () => JSON.stringify(selectedRef.value),
  async (value: string | null, oldValue: string | undefined): Promise<void> => {
    if (selectedRef.value?.id === null) {
      selectedRef.value = null;
    }
  },
  { immediate: true }
);

interface Props {
  activeColumns: ColumnDefinition[];
  autoCompleteData: TransformedAttendeeInfo[];
}

const props: Props = defineProps<Props>();

const displayOptionsRef: ModelRef<AttendeeTableDisplayOptions> =
  defineModel<AttendeeTableDisplayOptions>("displayOptions", {
    required: true,
  });

const attendeeInfosRef: ModelRef<TransformedAttendeeInfo[]> = defineModel<
  TransformedAttendeeInfo[]
>({ required: true });

defineEmits(["onSort", "onPage", "onFilter"]);
</script>

<style lang="css">
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
