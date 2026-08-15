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
    <AttendeeChart
      label="Attendance"
      chartType="bar"
      cssClass="w-192"
      v-bind:data="attendanceData"
      @chartSelect="(v) => emit('filterSelect', { field: 'transDayAttendance', value: v })"
    />
    <AttendeeChart
      label="Interests"
      chartType="bar"
      cssClass="w-192"
      v-bind:data="optionsData"
    />
    <AttendeeChart
      label="T-Shirt Sizes (holders only)"
      chartType="bar"
      cssClass="w-192"
      v-bind:data="tshirtData"
    />
    <AttendeeChart
      label="Fursuit Badges"
      chartType="bar"
      cssClass="w-192"
      v-bind:data="fursuitData"
    />
    <AttendeeChart
      label="Benefactor Packages per Registration"
      chartType="bar"
      cssClass="w-192"
      v-bind:data="benefactorPackageCountData"
    />
    <AttendeeChartWithLogToggle
      label="Countries"
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
    <AttendeeChartWithLogToggle label="Languages" v-bind:data="languageData" />
    <AttendeeChartWithLogToggle
      label="Age"
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
import AttendeeChart from "@/components/statistics/AttendeeChart.vue";
import AttendeeChartWithLogToggle from "@/components/statistics/AttendeeChartWithLogToggle.vue";
import { getDiagramDataFromList } from "@/composables/statistics/getDiagramDataFromList";
import { getConventionSetup } from "@/composables/logic/getConventionSetup";
import {
  computeAttendeeStatisticEntries,
  type AttendeeStatisticEntry,
} from "@/composables/statistics/computeAttendeeStatisticEntries";
import { getAttendanceChartData } from "@/composables/statistics/getAttendanceChartData";
import { getBenefactorPackageCountChartData } from "@/composables/statistics/getBenefactorPackageCountChartData";
import { getFursuitChartData } from "@/composables/statistics/getFursuitChartData";
import { getStatsFromProperty } from "@/composables/statistics/getStatsFromProperty";
import { getTshirtChartData } from "@/composables/statistics/getTshirtChartData";
import { ColorsPalette } from "@/composables/theme/colors";
import type { TransformedAttendeeInfo } from "@/types/internal/attendee";
import type { ChartData } from "@/types/internal/statistics";
import type { FilterFieldValue } from "@/types/internal/filter";
import { computed, type ComputedRef, type ModelRef } from "vue";

const emit = defineEmits<{
  filterSelect: [selection: { field: FilterFieldValue; value: string }];
}>();

const attendeeInfosRef: ModelRef<TransformedAttendeeInfo[]> = defineModel<
  TransformedAttendeeInfo[]
>({ required: true });
const statsRef: ComputedRef<AttendeeStatisticEntry[]> =
  computeAttendeeStatisticEntries(attendeeInfosRef);

const attendanceData: ComputedRef<ChartData> = computed(() =>
  getAttendanceChartData(statsRef.value)
);

const tshirtData: ComputedRef<ChartData> = computed(() =>
  getTshirtChartData(statsRef.value)
);

const fursuitData: ComputedRef<ChartData> = computed(() =>
  getFursuitChartData(statsRef.value)
);

const benefactorPackageCountData: ComputedRef<ChartData> = computed(() =>
  getBenefactorPackageCountChartData(statsRef.value)
);

const languageData: ComputedRef<ChartData> = computed(() => {
  const values = statsRef.value.flatMap((a) => a.spoken_languages_list ?? []);
  return getDiagramDataFromList(
    values,
    getConventionSetup().metadata.forLanguage.list,
    { color: ColorsPalette.primary_400 }
  );
});

const optionsMetadata = [
  { value: "anim", label: "Animation", color: ColorsPalette.orange_400 },
  { value: "art", label: "Art", color: ColorsPalette.yellow_400 },
  { value: "music", label: "Music", color: ColorsPalette.green_400 },
  { value: "suit", label: "Fursuit", color: ColorsPalette.purple_400 },
] as const;

const optionsData: ComputedRef<ChartData> = computed(() => {
  const values = statsRef.value.flatMap((a) => a.options_list ?? []);
  return getDiagramDataFromList(values, [...optionsMetadata], {});
});
</script>
