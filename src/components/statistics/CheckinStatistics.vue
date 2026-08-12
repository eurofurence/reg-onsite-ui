<template>
  <div class="flex flex-wrap gap-5 place-content-center">
    <div class="grid-cols-1">
      <label class="flex justify-center">Checkin Throughput (per Hour)</label>
      <Chart
        type="bar"
        :data="checkinHourSeries"
        :options="timeAxisChartOptions"
        class="w-192"
      />
    </div>
    <div class="grid-cols-1">
      <label class="flex justify-center">Checkin Throughput (per Day)</label>
      <Chart
        type="bar"
        :data="checkinDaySeries"
        :options="defaultChartOptions"
        class="w-192"
      />
    </div>
    <div class="grid-cols-1">
      <label class="flex justify-center">Checkins by Sponsor Level (per Day)</label>
      <Chart
        type="bar"
        :data="sponsorLevelDaySeries"
        :options="sponsorLevelDayChartOptions"
        class="w-192"
      />
    </div>
    <div class="grid-cols-1">
      <label class="flex justify-center">Checkins by Sponsor Level (per Hour)</label>
      <Chart
        type="bar"
        :data="sponsorLevelHourSeries"
        :options="sponsorLevelHourChartOptions"
        class="w-192"
      />
    </div>
    <div class="grid-cols-1">
      <label class="flex justify-center">Checked-in Attendees by Sponsor Level (cumulative)</label>
      <Chart
        type="line"
        :data="cumulativeSponsorSeries"
        :options="cumulativeSponsorChartOptions"
        class="w-192"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import type { ApiAllAddInfo } from "@/types/external/attsrv/additional-info/common";
import type { ApiRegDeskAddInfo } from "@/types/external/attsrv/additional-info/regdesk";
import type { RegNumber } from "@/types/external/attsrv/attendees/attendee";
import type { TransformedAttendeeInfo } from "@/types/internal/attendee";
import "chartjs-adapter-date-fns";
import Chart from "primevue/chart";
import { computed, type ModelRef } from "vue";

interface Props {
  attendeeInfos: TransformedAttendeeInfo[];
}
const props = defineProps<Props>();

const modelValue: ModelRef<ApiAllAddInfo<ApiRegDeskAddInfo>> = defineModel<
  ApiAllAddInfo<ApiRegDeskAddInfo>
>({
  required: true,
});

const defaultChartOptions: any = {
  plugins: { legend: { labels: { usePointStyle: true } } },
};

const timeAxisChartOptions: any = {
  scales: {
    x: {
      type: "time",
      time: {
        tooltipFormat: "yyyy-MM-dd HH:mm",
        displayFormats: { hour: "HH:mm", minute: "HH:mm" },
      },
    },
  },
  plugins: { legend: { labels: { usePointStyle: true } } },
};

const sponsorLevelDayChartOptions: any = {
  scales: {
    x: { stacked: true },
    y: { stacked: true },
  },
  plugins: { legend: { labels: { usePointStyle: true } } },
};

const sponsorLevelHourChartOptions: any = {
  scales: {
    x: {
      type: "time",
      stacked: true,
      time: {
        tooltipFormat: "yyyy-MM-dd HH:mm",
        displayFormats: { hour: "HH:mm", minute: "HH:mm" },
      },
    },
    y: { stacked: true },
  },
  plugins: { legend: { labels: { usePointStyle: true } } },
};

const cumulativeSponsorChartOptions: any = {
  scales: {
    x: {
      type: "time",
      time: {
        tooltipFormat: "yyyy-MM-dd HH:mm",
        displayFormats: { hour: "HH:mm", minute: "HH:mm" },
      },
    },
    y: { beginAtZero: true },
  },
  plugins: { legend: { labels: { usePointStyle: true } } },
};

const checkinHourSeries = computed(() => {
  const frequencyMap: Record<string, number> = {};
  for (const info of modelValue.value.infos.values()) {
    if (!info.checkin_time) continue;
    const bin = info.checkin_time.substring(0, 13) + ":00";
    frequencyMap[bin] = (frequencyMap[bin] || 0) + 1;
  }
  const sortedBins = Object.keys(frequencyMap).sort();
  return {
    datasets: [
      {
        label: "Checkins per Hour",
        data: sortedBins.map((bin) => ({ x: bin, y: frequencyMap[bin] })),
      },
    ],
  };
});

const checkinDaySeries = computed(() => {
  const frequencyMap: Record<string, number> = {};
  for (const info of modelValue.value.infos.values()) {
    if (!info.checkin_time) continue;
    const bin = info.checkin_time.substring(0, 10);
    frequencyMap[bin] = (frequencyMap[bin] || 0) + 1;
  }
  const sortedBins = Object.keys(frequencyMap).sort();
  return {
    labels: sortedBins,
    datasets: [
      {
        label: "Checkins per Day",
        data: sortedBins.map((bin) => frequencyMap[bin]),
      },
    ],
  };
});

const sponsorMap = computed(() => {
  const map = new Map<RegNumber, string>();
  for (const attendee of props.attendeeInfos) {
    if (attendee.id !== null && attendee.transSponsorChoice !== null) {
      map.set(attendee.id, attendee.transSponsorChoice);
    }
  }
  return map;
});

function binCheckinsBySponsorLevel(
  binFn: (checkin_time: string) => string
): Record<string, Record<string, number>> {
  const bins: Record<string, Record<string, number>> = {};
  for (const [regNum, info] of modelValue.value.infos.entries()) {
    if (!info.checkin_time) continue;
    const bin = binFn(info.checkin_time);
    const level = sponsorMap.value.get(regNum) ?? "no_package";
    if (!bins[bin]) bins[bin] = {};
    bins[bin][level] = (bins[bin][level] || 0) + 1;
  }
  return bins;
}

const sponsorLevelDatasets = (_bins: Record<string, Record<string, number>>, sortedBins: string[], dataFn: (bin: string, level: string) => any) => [
  { label: "Regular",       data: sortedBins.map((b) => dataFn(b, "no_package")),   backgroundColor: "rgba(74, 222, 128, 0.7)",  stack: "checkins" },
  { label: "Contributor",   data: sortedBins.map((b) => dataFn(b, "contributor")),  backgroundColor: "rgba(94, 234, 212, 0.7)", stack: "checkins" },
  { label: "Sponsor",       data: sortedBins.map((b) => dataFn(b, "sponsor")),      backgroundColor: "rgba(250, 204, 21, 0.7)",  stack: "checkins" },
  { label: "Super-Sponsor", data: sortedBins.map((b) => dataFn(b, "sponsor2")),     backgroundColor: "rgba(192, 132, 252, 0.7)", stack: "checkins" },
];

const sponsorLevelDaySeries = computed(() => {
  const bins = binCheckinsBySponsorLevel((t) => t.substring(0, 10));
  const sortedBins = Object.keys(bins).sort();
  return {
    labels: sortedBins,
    datasets: sponsorLevelDatasets(bins, sortedBins, (b, l) => bins[b]?.[l] || 0),
  };
});

const sponsorLevelHourSeries = computed(() => {
  const bins = binCheckinsBySponsorLevel((t) => t.substring(0, 13) + ":00");
  const sortedBins = Object.keys(bins).sort();
  return {
    datasets: sponsorLevelDatasets(bins, sortedBins, (b, l) => ({ x: b, y: bins[b]?.[l] || 0 })),
  };
});

const cumulativeSponsorSeries = computed(() => {
  const bins = binCheckinsBySponsorLevel((t) => t.substring(0, 13) + ":00");
  const sortedBins = Object.keys(bins).sort();
  const running: Record<string, number> = { "no_package": 0, "contributor": 0, "sponsor": 0, "sponsor2": 0 };
  const data: Record<string, { x: string; y: number }[]> = { "no_package": [], "contributor": [], "sponsor": [], "sponsor2": [] };
  for (const bin of sortedBins) {
    for (const level of ["no_package", "contributor", "sponsor", "sponsor2"]) {
      running[level] = (running[level] ?? 0) + (bins[bin]?.[level] || 0);
      data[level]!.push({ x: bin, y: running[level]! });
    }
  }
  return {
    datasets: [
      { label: "Regular",       data: data["no_package"],   borderColor: "rgba(74, 222, 128, 1)",  backgroundColor: "rgba(74, 222, 128, 0.1)",  fill: true, tension: 0.1 },
      { label: "Contributor",   data: data["contributor"],  borderColor: "rgba(94, 234, 212, 1)", backgroundColor: "rgba(94, 234, 212, 0.1)", fill: true, tension: 0.1 },
      { label: "Sponsor",       data: data["sponsor"],      borderColor: "rgba(250, 204, 21, 1)",  backgroundColor: "rgba(250, 204, 21, 0.1)",  fill: true, tension: 0.1 },
      { label: "Super-Sponsor", data: data["sponsor2"],     borderColor: "rgba(192, 132, 252, 1)", backgroundColor: "rgba(192, 132, 252, 0.1)", fill: true, tension: 0.1 },
    ],
  };
});
</script>
