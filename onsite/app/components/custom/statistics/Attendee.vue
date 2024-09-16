<template>
  <div>
    <div class="flex flex-rows gap-5 p-2" v-if="false">
      <div class="flex align-items-center">
        <RadioButton
          v-model="filterStatusRef"
          inputId="filterStatusId + '_raw'"
          name="filterStatus"
          :value="FilterStatus.raw"
        />
        <label :for="filterStatusId + '_raw'" class="ml-2"
          >Unfiltered search result</label
        >
      </div>
      <div class="flex align-items-center">
        <RadioButton
          v-model="filterStatusRef"
          inputId="filterStatusId + '_filtered'"
          name="filterStatus"
          :value="FilterStatus.filtered"
        />
        <label :for="filterStatusId + '_filtered'" class="ml-2"
          >Filtered data
        </label>
      </div>
    </div>
    <CustomStatisticsAttendeeCharts v-model="attendeeInfosRef" />
  </div>
</template>

<script setup lang="ts">
import type { ModelRef } from "vue";
import type { TransformedAttendeeInfo } from "@/types/internal";
import { getFilteredAttendees } from "@/composables/sort_and_filter/getFilteredAttendees";

const enum FilterStatus {
  raw = "raw",
  filtered = "filtered",
}
type FilterStatusValue = `${FilterStatus}`;

//const data = dataSource == "search" ? attendeeInfosRef : getFilteredAttendees(props.searchResult, props.filters, props.globalSearchColumns);

const filterStatusRef: Ref<FilterStatusValue> = ref(FilterStatus.raw);
const attendeeInfosRef: ModelRef<TransformedAttendeeInfo[]> = defineModel<
  TransformedAttendeeInfo[]
>({ required: true });

const componentId: string = generateId(useId());
const filterStatusId: string = `statsFilterStatus${componentId}`;
</script>
