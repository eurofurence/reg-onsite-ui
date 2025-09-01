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
      :scrollable="true"
      tableStyle="min-width: 50rem"
      @page="$emit('onPage', $event)"
      @sort="$emit('onSort', $event)"
      @filter="$emit('onFilter', $event)"
    >
      <template #header>
        <div class="flex justify-between flex-wrap">
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
        <template #filter="{}">
          <div v-if="columnDefinition.filterConfig !== undefined">
            <SearchFieldBirthday
              v-if="columnDefinition.columnType === ColumnType.birthday"
              v-model="
                dataOptionsRef.filterConfig.filterValues[columnDefinition.value as AllFilterFieldValues]
                  .value
              "
              :columnDefinition="columnDefinition"
            />
            <SearchFieldCountry
              v-else-if="columnDefinition.columnType === ColumnType.country"
              v-model="
                dataOptionsRef.filterConfig.filterValues[columnDefinition.value as AllFilterFieldValues]
                  .value
              "
              :columnDefinition="columnDefinition"
              :autoCompleteData="props.autoCompleteData"
            />
            <SearchFieldTag
              v-else-if="columnDefinition.columnType === ColumnType.tag"
              v-model="
                dataOptionsRef.filterConfig.filterValues[columnDefinition.value as AllFilterFieldValues]
                  .value
              "
              :columnDefinition="columnDefinition"
              :configItems="columnDefinition.configItems"
              :autoCompleteData="props.autoCompleteData"
              :autoCompleteField="columnDefinition.value"
            />
            <SearchFieldStandard
              v-else-if="columnDefinition.columnType === ColumnType.standard"
              v-model="
                dataOptionsRef.filterConfig.filterValues[columnDefinition.value as AllFilterFieldValues]
                  .value
              "
              v-model:matchMode="
                dataOptionsRef.filterConfig.filterValues[columnDefinition.value as AllFilterFieldValues]
                  .matchMode as string
              "
              :columnDefinition="columnDefinition"
              :autoCompleteData="props.autoCompleteData"
              :autoCompleteField="columnDefinition.value"
              placeholder="Search"
            />
          </div>
        </template>
        <template #body="{ data }">
          <span :class="`table-field-${columnDefinition.value}`">
            <ColumnBirthday
              v-if="columnDefinition.columnType === ColumnType.birthday"
              :modelValue="data"
            />
            <ColumnCountry
              v-else-if="columnDefinition.columnType === ColumnType.country"
              :modelValue="data"
            />
            <TagControl
              v-else-if="columnDefinition.columnType === ColumnType.tag"
              :modelValue="data[columnDefinition.value]"
              :configItems="columnDefinition.configItems"
            />
            <ColumnCheckin
              v-else-if="columnDefinition.columnType === ColumnType.checkin"
              :modelValue="data"
            />
            <ColumnDues
              v-else-if="columnDefinition.columnType === ColumnType.dues"
              :modelValue="data[columnDefinition.value]"
            />
            <ColumnStandard
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
import ColumnBirthday from "@/components/common/attendee_table/ColumnBirthday.vue";
import ColumnCheckin from "@/components/common/attendee_table/ColumnCheckin.vue";
import ColumnCountry from "@/components/common/attendee_table/ColumnCountry.vue";
import ColumnDues from "@/components/common/attendee_table/ColumnDues.vue";
import ColumnStandard from "@/components/common/attendee_table/ColumnStandard.vue";
import SearchFieldBirthday from "@/components/common/attendee_table/SearchFieldBirthday.vue";
import SearchFieldCountry from "@/components/common/attendee_table/SearchFieldCountry.vue";
import SearchFieldStandard from "@/components/common/attendee_table/SearchFieldStandard.vue";
import SearchFieldTag from "@/components/common/attendee_table/SearchFieldTag.vue";
import TagControl from "@/components/common/TagControl.vue";
import type { TransformedAttendeeInfo } from "@/types/internal/attendee";
import {
  ColumnType,
  type ColumnDefinition,
} from "@/types/internal/component/table";
import type { AllFilterFieldValues } from "@/types/internal/filter";
import type {
  AttendeeDataOptions,
  AttendeeTableDisplayOptions,
} from "@/types/internal/system/regdesk";
import DataTable from "@/volt/DataTable.vue";
import Column from "primevue/column";
import { watch, type ModelRef } from "vue";

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
  async (
    _value: string | null,
    _oldValue: string | undefined
  ): Promise<void> => {
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

.attendee-table tbody > tr:nth-child(odd) {
  background-color: var(--p-surface-100);
}

.attendee-table tbody > tr:hover {
  background-color: var(--p-surface-200);
}

.p-dark .attendee-table tbody > tr:nth-child(odd) {
  background-color: var(--p-surface-800);
}

.p-dark .attendee-table tbody > tr:hover {
  background-color: var(--p-surface-700);
}
</style>
