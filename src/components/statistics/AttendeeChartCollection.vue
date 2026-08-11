<template>
  <div class="flex flex-wrap gap-5 place-content-center">
    <AttendeeChart
      label="Status"
      v-bind:data="
        getStatsFromProperty(
          statsRef,
          'status',
          getConventionSetup().metadata.forStatus.list,
          {}
        )
      "
      @chartSelect="(v) => emit('filterSelect', { field: 'status', value: v })"
    />
    <AttendeeChart
      label="Sponsor Level"
      v-bind:data="
        getStatsFromProperty(
          statsRef,
          'transSponsorChoice',
          getConventionSetup().metadata.forSponsorLevels.list,
          {}
        )
      "
      @chartSelect="(v) => emit('filterSelect', { field: 'transSponsorChoice', value: v })"
    />
    <AttendeeChart
      label="Con Book"
      v-bind:data="
        getStatsFromProperty(
          statsRef,
          'transConbookChoice',
          getConventionSetup().metadata.forConBook.list,
          {}
        )
      "
      @chartSelect="(v) => emit('filterSelect', { field: 'transConbookChoice', value: v })"
    />
    <AttendeeChart
      label="Roles"
      v-bind:data="
        getStatsFromProperty(
          statsRef,
          'transConRole',
          getConventionSetup().metadata.forConRole.list,
          {
            flatten: true,
          }
        )
      "
      @chartSelect="(v) => emit('filterSelect', { field: 'transConRole', value: v })"
    />
    <div class="flex flex-col">
      <AttendeeChart
        label="Countries"
        chartType="bar"
        cssClass="w-192"
        :chartOptions="isLogCountries ? barlogYChartOptions : {}"
        v-bind:data="
          getStatsFromProperty(
            statsRef,
            'country',
            getConventionSetup().metadata.forCountry.list,
            {
              color: ColorsPalette.primary_400,
            }
          )
        "
        @chartSelect="(v) => emit('filterSelect', { field: 'country', value: v })"
      />
      <div class="flex flex-row flex-grow mx-auto">
        <div><ToggleSwitch v-model="isLogCountries" /></div>
        <div class="pl-2">Log</div>
      </div>
    </div>
    <div class="flex flex-col">
      <AttendeeChart
        label="Age"
        chartType="bar"
        cssClass="w-192"
        :chartOptions="isLogAge ? barlogYChartOptions : {}"
        v-bind:data="
          getStatsFromProperty(statsRef, 'transAge', [], {
            color: ColorsPalette.green_400,
            sort: 'label',
          })
        "
      />
      <div class="flex flex-row flex-grow mx-auto">
        <div><ToggleSwitch v-model="isLogAge" /></div>
        <div class="pl-2">Log</div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import AttendeeChart from "@/components/statistics/AttendeeChart.vue";
import { getConventionSetup } from "@/composables/logic/getConventionSetup";
import {
  computeAttendeeStatisticEntries,
  type AttendeeStatisticEntry,
} from "@/composables/statistics/computeAttendeeStatisticEntries";
import { getStatsFromProperty } from "@/composables/statistics/getStatsFromProperty";
import { ColorsPalette } from "@/composables/theme/colors";
import type { TransformedAttendeeInfo } from "@/types/internal/attendee";
import type { FilterFieldValue } from "@/types/internal/filter";
import ToggleSwitch from "@/volt/ToggleSwitch.vue";
import { ref, type ComputedRef, type ModelRef, type Ref } from "vue";

const emit = defineEmits<{
  filterSelect: [selection: { field: FilterFieldValue; value: string }];
}>();

const isLogCountries: Ref<boolean> = ref(false);
const isLogAge: Ref<boolean> = ref(false);

const barlogYChartOptions: any = {
  plugins: {
    legend: {
      labels: {
        usePointStyle: true,
      },
    },
  },
  scales: {
    y: {
      min: 0.9,
      display: true,
      type: "logarithmic",
    },
  },
};

const attendeeInfosRef: ModelRef<TransformedAttendeeInfo[]> = defineModel<
  TransformedAttendeeInfo[]
>({ required: true });
const statsRef: ComputedRef<AttendeeStatisticEntry[]> =
  computeAttendeeStatisticEntries(attendeeInfosRef);
</script>
