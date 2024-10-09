<template>
  <div class="flex flex-wrap gap-5 place-content-center">
    <CustomStatisticsChart
      label="Status"
      v-bind:data="
        getStatsFromProperty(statsRef, 'status', metadataListForStatus, {})
      "
    />
    <CustomStatisticsChart
      label="Sponsor Level"
      v-bind:data="
        getStatsFromProperty(
          statsRef,
          'transSponsorChoice',
          metadataListForSponsorLevels,
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
          metadataListForConBookChoice,
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
          metadataListForConRoles,
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
        getStatsFromProperty(statsRef, 'country', metadataListForCountry, {
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
import { metadataListForConBookChoice } from "@/config/metadata/flags/metadataForConBookChoice";
import { metadataListForSponsorLevels } from "@/config/metadata/packages/metadataForSponsorLevels";
import { metadataListForConRoles } from "@/config/metadata/flags/metadataForConRoles";
import { metadataListForStatus } from "@/config/metadata/metadataForStatus";
import type { ModelRef } from "vue";
import { metadataListForCountry } from "@/config/metadata/metadataForCountry";
import { ColorsPalette } from "@/composables/theme/colors";
import type { TransformedAttendeeInfo } from "@/types/internal/attendee";

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
