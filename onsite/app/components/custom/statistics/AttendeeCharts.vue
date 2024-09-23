<template>
  <div class="flex flex-wrap gap-5 place-content-center">
    <CustomStatisticsChart
      label="Status"
      v-bind:data="getStatsFromProperty(statsRef, 'status', setupStatus, {})"
    />
    <CustomStatisticsChart
      label="Sponsor Level"
      v-bind:data="
        getStatsFromProperty(
          statsRef,
          'transSponsorChoice',
          setupSponsorLevels,
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
          setupConBookChoices,
          {}
        )
      "
    />
    <CustomStatisticsChart
      label="Roles"
      v-bind:data="
        getStatsFromProperty(statsRef, 'transConRole', setupConRoles, {
          flatten: true,
        })
      "
    />
    <CustomStatisticsChart
      label="Countries"
      chartType="bar"
      cssClass="w-[50rem]"
      :chartOptions="barlogYChartOptions"
      v-bind:data="
        getStatsFromProperty(statsRef, 'country', setupCountries, {
          color: ColorsPalette.primary_400,
        })
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
import { setupConBookChoices } from "@/config/flags/setupConBookChoices";
import { setupConRoles } from "@/config/setupConRoles";
import { setupSponsorLevels } from "@/config/packages/setupSponsorLevels";
import { setupStatus } from "@/config/setupStatus";
import type { TransformedAttendeeInfo } from "@/types/internal";
import type { ModelRef } from "vue";
import { setupCountries } from "@/config/setupCountries";
import { ColorsPalette } from "@/config/theme";

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
