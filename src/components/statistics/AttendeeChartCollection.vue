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
        label="Languages"
        chartType="bar"
        cssClass="w-192"
        :chartOptions="isLogLanguages ? barlogYChartOptions : {}"
        v-bind:data="languageData"
      />
      <div class="flex flex-row flex-grow mx-auto">
        <div><ToggleSwitch v-model="isLogLanguages" /></div>
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
import { getColorFromStyle } from "@/composables/colors/getColorFromStyle";
import { getColorVariants } from "@/composables/colors/getColorVariants";
import { getDiagramDataFromList } from "@/composables/statistics/getDiagramDataFromList";
import { getConventionSetup } from "@/composables/logic/getConventionSetup";
import {
  computeAttendeeStatisticEntries,
  type AttendeeStatisticEntry,
} from "@/composables/statistics/computeAttendeeStatisticEntries";
import { getStatsFromProperty } from "@/composables/statistics/getStatsFromProperty";
import { ColorsPalette } from "@/composables/theme/colors";
import { AttendeeApiAttendance } from "@/config/metadata/packages/metadataForAttendance";
import { metadataListForTShirtTypesInternal, TShirtType } from "@/config/metadata/tshirt/metadataForTShirtTypes";
import { UnusedPackages } from "@/types/external/attsrv/attendees/attendee";
import { NoPackage } from "@/types/internal/missing";
import type { TransformedAttendeeInfo } from "@/types/internal/attendee";
import type { ChartData } from "@/types/internal/statistics";
import type { FilterFieldValue } from "@/types/internal/filter";
import ToggleSwitch from "@/volt/ToggleSwitch.vue";
import { computed, ref, type ComputedRef, type ModelRef, type Ref } from "vue";

const emit = defineEmits<{
  filterSelect: [selection: { field: FilterFieldValue; value: string }];
}>();

const isLogCountries: Ref<boolean> = ref(false);
const isLogAge: Ref<boolean> = ref(false);
const isLogLanguages: Ref<boolean> = ref(false);

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

const attendanceApiValues = new Set<string>(Object.values(AttendeeApiAttendance));

const attendanceData: ComputedRef<ChartData> = computed(() => {
  const values = statsRef.value.map((a) => {
    const pkg = (a.packages_list ?? []).find((p) => attendanceApiValues.has(p.name));
    return pkg?.name ?? AttendeeApiAttendance.full;
  });
  return getDiagramDataFromList(
    values,
    getConventionSetup().metadata.forDayAttendance.list,
    { color: ColorsPalette.primary_400 }
  );
});

const tshirtData: ComputedRef<ChartData> = computed(() => {
  const countMap: Record<string, number> = {};
  for (const a of statsRef.value) {
    if (a.transGoodieChoice !== null && a.transGoodieChoice !== NoPackage.no_package) {
      const size = a.tshirt_size ?? TShirtType.regular_unknown;
      countMap[size] = (countMap[size] || 0) + 1;
    }
  }
  const [main, alt] = getColorVariants(ColorsPalette.orange_400);
  const bgColor = getColorFromStyle(main);
  const hoverColor = getColorFromStyle(alt);
  return {
    labels: metadataListForTShirtTypesInternal.map((m) => m.label),
    values: metadataListForTShirtTypesInternal.map((m) => m.value),
    datasets: [
      {
        label: "Count",
        data: metadataListForTShirtTypesInternal.map((m) => countMap[m.value] || 0),
        backgroundColor: metadataListForTShirtTypesInternal.map(() => bgColor),
        hoverBackgroundColor: metadataListForTShirtTypesInternal.map(() => hoverColor),
      },
    ],
  };
});

const fursuitData: ComputedRef<ChartData> = computed(() => {
  let badgeCount = 0;
  let addCount = 0;
  for (const a of statsRef.value) {
    for (const pkg of a.packages_list ?? []) {
      if (pkg.name === UnusedPackages.fursuit_badge) badgeCount += pkg.count;
      if (pkg.name === UnusedPackages.fursuit_add) addCount += pkg.count;
    }
  }
  const [main, alt] = getColorVariants(ColorsPalette.purple_400);
  const bgColor = getColorFromStyle(main);
  const hoverColor = getColorFromStyle(alt);
  return {
    labels: ["Fursuit Badge", "Fursuit Add-on"],
    values: [UnusedPackages.fursuit_badge, UnusedPackages.fursuit_add],
    datasets: [
      {
        label: "Count",
        data: [badgeCount, addCount],
        backgroundColor: [bgColor, bgColor],
        hoverBackgroundColor: [hoverColor, hoverColor],
      },
    ],
  };
});

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
