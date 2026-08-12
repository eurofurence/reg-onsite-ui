<template>
  <div class="grid-cols-1">
    <div class="flex items-center justify-center gap-2 mb-1">
      <label>Item Frequencies</label>
      <Button size="small" :outlined="!logScaleFrequency" v-tooltip.top="'Toggle log scale'" @click="logScaleFrequency = !logScaleFrequency">log</Button>
    </div>
    <Chart type="bar" :data="chartData" :options="frequencyChartOptions" class="w-192" />
  </div>
</template>

<script setup lang="ts">
import { getOwedConcreteItems } from "@/composables/items/getOwedConcreteItems";
import { getEmptySponsorDeskAddInfo } from "@/composables/services/attendee/getEmptySponsorDeskAddInfo";
import type { ApiSponsorDeskAddInfo } from "@/types/external/attsrv/additional-info/sponsordesk";
import type { RegNumber } from "@/types/external/attsrv/attendees/attendee";
import type { TransformedAttendeeInfo } from "@/types/internal/attendee";
import Button from "@/volt/Button.vue";
import Chart from "primevue/chart";
import { computed, ref } from "vue";

interface Props {
  infosMap: Map<RegNumber, ApiSponsorDeskAddInfo>;
  attendeeInfos: TransformedAttendeeInfo[];
}
const props = defineProps<Props>();

const logScaleFrequency = ref(false);

const frequencyChartOptions = computed(() => ({
  plugins: { legend: { labels: { usePointStyle: true } } },
  scales: {
    y: {
      type: logScaleFrequency.value ? "logarithmic" : "linear",
      ...(logScaleFrequency.value ? { min: 0.1 } : {}),
    },
  },
}));

const chartData = computed(() => {
  const issuedCount: Record<string, number> = {};
  const reservedCount: Record<string, number> = {};
  const boughtCount: Record<string, number> = {};
  for (const { issuedItems, reservedItems } of props.infosMap.values()) {
    for (const item of issuedItems || []) issuedCount[item] = (issuedCount[item] || 0) + 1;
    for (const item of reservedItems || []) reservedCount[item] = (reservedCount[item] || 0) + 1;
  }
  for (const attendee of props.attendeeInfos) {
    const sponsorInfo = attendee.id === null ? getEmptySponsorDeskAddInfo() : props.infosMap.get(attendee.id) ?? getEmptySponsorDeskAddInfo();
    for (const item of getOwedConcreteItems(attendee, sponsorInfo))
      boughtCount[item] = (boughtCount[item] || 0) + 1;
  }
  const allItems = [...new Set([...Object.keys(issuedCount), ...Object.keys(reservedCount), ...Object.keys(boughtCount)])].sort((a, b) => a.localeCompare(b));
  return {
    labels: allItems,
    datasets: [
      { label: "Issued Items", data: allItems.map((item) => issuedCount[item] || 0), backgroundColor: "rgba(75, 192, 192, 0.6)" },
      { label: "Reserved Items", data: allItems.map((item) => reservedCount[item] || 0), backgroundColor: "rgba(255, 159, 64, 0.6)" },
      { label: "Bought Items", data: allItems.map((item) => boughtCount[item] || 0), backgroundColor: "rgba(153, 102, 255, 0.6)" },
    ],
  };
});
</script>
