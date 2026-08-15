<template>
  <div class="flex flex-col gap-5">
    <div class="flex flex-row gap-5 justify-center">
      <div class="flex items-center">
        <RadioButton
          v-model="filterStatusRef"
          :inputId="filterStatusId + '_raw'"
          name="filterStatus"
          :value="FilterStatus.raw"
        />
        <label :for="filterStatusId + '_raw'" class="ml-2">
          Unfiltered search result
        </label>
      </div>
      <div class="flex items-center">
        <RadioButton
          v-model="filterStatusRef"
          :inputId="filterStatusId + '_filtered'"
          name="filterStatus"
          :value="FilterStatus.filtered"
        />
        <label :for="filterStatusId + '_filtered'" class="ml-2">
          Filtered data
        </label>
      </div>
    </div>
    <div
      class="flex flex-row gap-5 justify-center"
      v-if="filterStatusRef !== FilterStatus.raw"
    >
      <div v-for="columnDefinition of chartOrderedTagColumns" class="flex flex-col gap-1">
        <label>{{ columnDefinition.label }}</label>
        <SearchFieldTag
          v-model="filterOptionsRef[columnDefinition.value as AllFilterFieldValues].value"
          :columnDefinition="columnDefinition"
          :configItems="columnDefinition.configItems"
          placeholder="Search"
        />
      </div>
      <div v-if="attendanceColumn" class="flex flex-col gap-1">
        <label>{{ attendanceColumn.label }}</label>
        <SearchFieldAttendance
          v-model="filterOptionsRef[attendanceColumn.value as AllFilterFieldValues].value"
          :columnDefinition="attendanceColumn"
          :configItems="attendanceColumn.configItems"
        />
      </div>
      <div v-if="countryColumn" class="flex flex-col gap-1">
        <label>{{ countryColumn.label }}</label>
        <SearchFieldCountry
          v-model="filterOptionsRef.country.value"
          :columnDefinition="countryColumn"
          :autoCompleteData="attendeeInfosRef"
        />
      </div>
      <div class="flex items-end">
        <Button
          class="h-12 aspect-square"
          v-tooltip.top="'Reset filters'"
          @click="onResetFilters()"
        >
          <i class="pi pi-filter-slash" />
        </Button>
      </div>
    </div>
    <div>
      <AttendeeChartCollection v-model="filteredListRef" @filterSelect="onFilterSelect" />
    </div>
  </div>
</template>

<script setup lang="ts">
import SearchFieldAttendance from "@/components/common/attendee_table/SearchFieldAttendance.vue";
import SearchFieldCountry from "@/components/common/attendee_table/SearchFieldCountry.vue";
import SearchFieldTag from "@/components/common/attendee_table/SearchFieldTag.vue";
import AttendeeChartCollection from "@/components/statistics/AttendeeChartCollection.vue";
import { deepCopy } from "@/composables/deepCopy";
import { generateId } from "@/composables/generateId";
import { getFilteredAttendees } from "@/composables/sort_and_filter/getFilteredAttendees";
import { AttendeeApiStatus } from "@/config/metadata/metadataForStatus";
import {
  getDefaultAttendeeFilterValues,
  setupColumnDefinitionList,
} from "@/config/system/regdesk";
import type { TransformedAttendeeInfo } from "@/types/internal/attendee";
import {
  ColumnType,
  type AttendanceColumn,
  type ColumnDefinition,
  type CountryColumn,
  type TagColumn,
} from "@/types/internal/component/table";
import type {
  AllFilterFieldValues,
  FilterFieldValue,
  RawAttendeeFilter,
} from "@/types/internal/filter";
import Button from "@/volt/Button.vue";
import RadioButton from "@/volt/RadioButton.vue";
import { FilterMatchMode } from "@primevue/core/api";
import {
  computed,
  ref,
  useId,
  type ComputedRef,
  type ModelRef,
  type Ref,
} from "vue";

const enum FilterStatus {
  raw = "raw",
  filtered = "filtered",
}
type FilterStatusValue = `${FilterStatus}`;

interface Props {
  filters?: RawAttendeeFilter;
}
const props = defineProps<Props>();

const filterStatusRef: Ref<FilterStatusValue> = ref(
  props.filters ? FilterStatus.filtered : FilterStatus.raw
);
const attendeeInfosRef: ModelRef<TransformedAttendeeInfo[]> = defineModel<
  TransformedAttendeeInfo[]
>({ required: true });
function getInitialFilterValues(): RawAttendeeFilter {
  return (
    props.filters ?? {
      ...getDefaultAttendeeFilterValues(),
      ...{
        status: {
          value: [
            AttendeeApiStatus.new,
            AttendeeApiStatus.approved,
            AttendeeApiStatus.partially_paid,
            AttendeeApiStatus.paid,
            AttendeeApiStatus.checked_in,
            AttendeeApiStatus.cancelled,
            AttendeeApiStatus.deleted,
          ],
          matchMode: FilterMatchMode.IN,
        },
      },
    }
  );
}

const initialFilterValues: RawAttendeeFilter = getInitialFilterValues();
const filterOptionsRef: Ref<RawAttendeeFilter> = ref(
  deepCopy(initialFilterValues)
);

function onResetFilters(): void {
  filterOptionsRef.value = deepCopy(initialFilterValues);
}

const chartFieldOrder: FilterFieldValue[] = [
  "status",
  "transSponsorChoice",
  "transConbookChoice",
  "transConRole",
];

const chartOrderedTagColumns: TagColumn[] = chartFieldOrder
  .map((field: FilterFieldValue) =>
    setupColumnDefinitionList.find(
      (columnDefinition: ColumnDefinition) => columnDefinition.value === field
    )
  )
  .filter(
    (columnDefinition): columnDefinition is TagColumn =>
      columnDefinition !== undefined &&
      columnDefinition.columnType === ColumnType.tag
  );

const attendanceColumnDefinition: ColumnDefinition | undefined =
  setupColumnDefinitionList.find(
    (columnDefinition: ColumnDefinition) =>
      columnDefinition.value === "transDayAttendance"
  );
const attendanceColumn: AttendanceColumn | undefined =
  attendanceColumnDefinition?.columnType === ColumnType.attendance
    ? attendanceColumnDefinition
    : undefined;

const countryColumnDefinition: ColumnDefinition | undefined =
  setupColumnDefinitionList.find(
    (columnDefinition: ColumnDefinition) => columnDefinition.value === "country"
  );
const countryColumn: CountryColumn | undefined =
  countryColumnDefinition?.columnType === ColumnType.country
    ? countryColumnDefinition
    : undefined;

const filteredListRef: ComputedRef<TransformedAttendeeInfo[]> = computed(() => {
  if (filterStatusRef.value === FilterStatus.raw) {
    return attendeeInfosRef.value;
  }
  return getFilteredAttendees(
    attendeeInfosRef.value,
    filterOptionsRef.value,
    []
  );
});

function onFilterSelect(selection: {
  field: FilterFieldValue;
  value: string;
}): void {
  filterOptionsRef.value[selection.field].value = [selection.value];
  filterStatusRef.value = FilterStatus.filtered;
}

const componentId: string = generateId(useId());
const filterStatusId: string = `statsFilterStatus${componentId}`;
</script>
