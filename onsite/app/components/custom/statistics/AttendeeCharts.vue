<template>
  <div class="flex flex-wrap gap-5 place-content-center">
    <CustomStatisticsChart
      label="Status"
      v-bind:data="
        getStatsFromProperty(
          statsRef,
          'status',
          getConventionSetup().metadata.forStatus.list,
          {}
        )
      "
    />
    <CustomStatisticsChart
      label="Sponsor Level"
      v-bind:data="
        getStatsFromProperty(
          statsRef,
          'transSponsorChoice',
          getConventionSetup().metadata.forSponsorLevels.list,
          {}
        )
      "
    />
    <CustomStatisticsChart
      label="Con Book"
      v-bind:data="
        getStatsFromProperty(
          statsRef,
          'transConbookChoice',
          getConventionSetup().metadata.forConBook.list,
          {}
        )
      "
    />
    <CustomStatisticsChart
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
    />
    <CustomStatisticsChart
      label="Countries"
      chartType="bar"
      cssClass="w-[50rem]"
      :chartOptions="barlogYChartOptions"
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
    />
    <CustomStatisticsChart
      label="Age"
      chartType="bar"
      cssClass="w-[50rem]"
      :chartOptions="barlogYChartOptions"
      v-bind:data="
        getStatsFromProperty(statsRef, 'transAge', [], {
          color: ColorsPalette.green_400,
          sort: 'label',
        })
      "
    />
  </div>
</template>

<script setup lang="ts">
import {
  type AttendeeStatisticEntry,
  computeAttendeeStatisticEntries,
} from "@/composables/statistics/computeAttendeeStatisticEntries";
import { getStatsFromProperty } from "@/composables/statistics/getStatsFromProperty";
import type { ModelRef } from "vue";
import { ColorsPalette } from "@/composables/theme/colors";
import type { TransformedAttendeeInfo } from "@/types/internal/attendee";
import { getConventionSetup } from "@/composables/logic/getConventionSetup";

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
