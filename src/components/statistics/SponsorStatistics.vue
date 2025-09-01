<template>
  <div class="flex flex-wrap gap-5 place-content-center">
    <div class="grid-cols-1">
      <label class="flex justify-center">Item Frequencies</label>
      <Chart
        type="bar"
        :data="generateFrequencyChartDataFromMap(modelValue.infos)"
        :options="defaultChartOptions"
        class="w-192"
      />
    </div>

    <div class="grid-cols-1">
      <label class="flex justify-center">T-Shirt Sizes</label>
      <Chart
        type="pie"
        :data="getTshirtPieChartData(modelValue.infos)"
        class="w-96 h-96"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import type { ApiAllAddInfo } from "@/types/external/attsrv/additional-info/common";
import type { ApiSponsorDeskAddInfo } from "@/types/external/attsrv/additional-info/sponsordesk";
import type { RegNumber } from "@/types/external/attsrv/attendees/attendee";
import Chart from "primevue/chart";
import type { ModelRef } from "vue";

const defaultChartOptions: any = {
  plugins: {
    legend: {
      labels: {
        usePointStyle: true,
      },
    },
  },
};

function generateFrequencyChartDataFromMap(
  infosMap: Map<RegNumber, ApiSponsorDeskAddInfo>
) {
  const issuedCount: Record<string, number> = {};
  const reservedCount: Record<string, number> = {};

  for (const { issuedItems, reservedItems } of infosMap.values()) {
    for (const item of issuedItems || []) {
      issuedCount[item] = (issuedCount[item] || 0) + 1;
    }
    for (const item of reservedItems || []) {
      reservedCount[item] = (reservedCount[item] || 0) + 1;
    }
  }

  // Get all unique item labels, sorted alphabetically
  const allItems = [
    ...new Set([...Object.keys(issuedCount), ...Object.keys(reservedCount)]),
  ].sort((a, b) => a.localeCompare(b));

  return {
    labels: allItems,
    datasets: [
      {
        label: "Issued Items",
        data: allItems.map((item) => issuedCount[item] || 0),
        backgroundColor: "rgba(75, 192, 192, 0.6)",
      },
      {
        label: "Reserved Items",
        data: allItems.map((item) => reservedCount[item] || 0),
        backgroundColor: "rgba(255, 159, 64, 0.6)",
      },
    ],
  };
}

import type { ChartData } from "chart.js";

function getTshirtPieChartData(
  infosMap: Map<number, { issuedItems: string[]; reservedItems: string[] }>
): ChartData<"pie"> {
  const frequencyMap = new Map<string, number>();

  for (const { issuedItems, reservedItems } of infosMap.values()) {
    const allItems = [...issuedItems, ...reservedItems];
    for (const item of allItems) {
      if (item.startsWith("tshirt")) {
        frequencyMap.set(item, (frequencyMap.get(item) ?? 0) + 1);
      }
    }
  }

  const labels = [...frequencyMap.keys()];
  const data = labels.map((label) => frequencyMap.get(label) ?? 0);

  return {
    labels,
    datasets: [
      {
        label: "T-shirt Distribution",
        data,
      },
    ],
  };
}

const modelValue: ModelRef<ApiAllAddInfo<ApiSponsorDeskAddInfo>> = defineModel<
  ApiAllAddInfo<ApiSponsorDeskAddInfo>
>({
  required: true,
});
</script>
