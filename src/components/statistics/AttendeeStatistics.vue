<template>
  <div class="flex flex-col gap-5">
    <div class="flex flex-row gap-5 justify-center">
      <div class="flex items-center">
        <RadioButton
          v-model="filterStatusRef"
          inputId="filterStatusId + '_raw'"
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
          inputId="filterStatusId + '_filtered'"
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
      <div v-for="columnDefinition of setupColumnDefinitionList">
        <SearchFieldTag
          v-model="filterOptionsRef[columnDefinition.value as AllFilterFieldValues].value"
          :columnDefinition="columnDefinition"
          :configItems="columnDefinition.configItems"
          placeholder="Search"
          v-if="columnDefinition.columnType === ColumnType.tag"
        />
      </div>
    </div>
    <div>
      <AttendeeChartCollection v-model="filteredListRef" />
    </div>
  </div>
</template>

<script setup lang="ts">
import SearchFieldTag from "@/components/common/attendee_table/SearchFieldTag.vue";
import AttendeeChartCollection from "@/components/statistics/AttendeeChartCollection.vue";
import { generateId } from "@/composables/generateId";
import { getFilteredAttendees } from "@/composables/sort_and_filter/getFilteredAttendees";
import { AttendeeApiStatus } from "@/config/metadata/metadataForStatus";
import {
  getDefaultAttendeeFilterValues,
  setupColumnDefinitionList,
} from "@/config/system/regdesk";
import type { TransformedAttendeeInfo } from "@/types/internal/attendee";
import { ColumnType } from "@/types/internal/component/table";
import type {
  AllFilterFieldValues,
  RawAttendeeFilter,
} from "@/types/internal/filter";
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

const filterStatusRef: Ref<FilterStatusValue> = ref(FilterStatus.raw);
const attendeeInfosRef: ModelRef<TransformedAttendeeInfo[]> = defineModel<
  TransformedAttendeeInfo[]
>({ required: true });
const filterOptionsRef: Ref<RawAttendeeFilter> = ref({
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
});

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

const componentId: string = generateId(useId());
const filterStatusId: string = `statsFilterStatus${componentId}`;
</script>
