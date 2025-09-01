<template>
  <div class="flex flex-wrap gap-5 place-content-center">
    <div class="grid-cols-1">
      <label class="flex justify-center">Checkin Throughput</label>
      <Chart
        type="bar"
        :data="getCheckinTimeSeries(modelValue)"
        :options="defaultChartOptions"
        class="w-192"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import type { ApiAllAddInfo } from "@/types/external/attsrv/additional-info/common";
import type { ApiRegDeskAddInfo } from "@/types/external/attsrv/additional-info/regdesk";
import "chartjs-adapter-date-fns";
import Chart from "primevue/chart";
import type { ModelRef } from "vue";

const defaultChartOptions: any = {
  scales: {
    x: {
      type: "time",
      time: {
        tooltipFormat: "yyyy-MM-dd HH:mm",
        displayFormats: {
          hour: "HH:mm",
          minute: "HH:mm",
        },
      },
    },
  },
  plugins: {
    legend: {
      labels: {
        usePointStyle: true,
      },
    },
  },
};

function getCheckinTimeSeries(rawData: ApiAllAddInfo<ApiRegDeskAddInfo>) {
  const frequencyMap: Record<string, number> = {};
  Array.from(rawData.infos.values())
    .map((value: ApiRegDeskAddInfo) => value.checkin_time)
    .filter((value: string | null) => value !== null)
    .forEach((value: string) => {
      const bin = value.substring(0, 13) + ":00"; // e.g., "2025-08-30T21:00"
      frequencyMap[bin] = (frequencyMap[bin] || 0) + 1;
    });
  const sortedBins = Object.keys(frequencyMap).sort();
  const counts = sortedBins.map((bin) => ({ x: bin, y: frequencyMap[bin] }));
  return {
    //labels: sortedBins.map((label) => label.replace("T", " ")),
    datasets: [
      {
        label: "Checkin Count per Hour",
        data: counts,
      },
    ],
  };
}

const modelValue: ModelRef<ApiAllAddInfo<ApiRegDeskAddInfo>> = defineModel<
  ApiAllAddInfo<ApiRegDeskAddInfo>
>({
  required: true,
});
</script>
