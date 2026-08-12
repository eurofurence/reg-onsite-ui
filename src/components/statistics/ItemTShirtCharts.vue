<template>
  <div class="grid-cols-1">
    <label class="flex justify-center mb-1">Issued T-Shirts</label>
    <Chart type="pie" :data="tshirtPieData(tshirtCounts.issuedCount)" :options="noLegendOptions" class="w-64 h-64" />
  </div>
  <div class="grid-cols-1">
    <label class="flex justify-center mb-1">Reserved T-Shirts</label>
    <Chart type="pie" :data="tshirtPieData(tshirtCounts.reservedCount)" :options="noLegendOptions" class="w-64 h-64" />
  </div>
  <div class="grid-cols-1">
    <label class="flex justify-center mb-1">Owed T-Shirts</label>
    <Chart type="pie" :data="tshirtPieData(tshirtCounts.owedCount)" :options="noLegendOptions" class="w-64 h-64" />
  </div>
</template>

<script setup lang="ts">
import { getOwedConcreteItems } from "@/composables/items/getOwedConcreteItems";
import { getEmptySponsorDeskAddInfo } from "@/composables/services/attendee/getEmptySponsorDeskAddInfo";
import { metadataListForTShirtTypesInternal } from "@/config/metadata/tshirt/metadataForTShirtTypes";
import type { TShirtTypeValue } from "@/config/metadata/tshirt/metadataForTShirtTypes";
import type { ApiSponsorDeskAddInfo } from "@/types/external/attsrv/additional-info/sponsordesk";
import type { RegNumber } from "@/types/external/attsrv/attendees/attendee";
import type { TransformedAttendeeInfo } from "@/types/internal/attendee";
import Chart from "primevue/chart";
import { computed } from "vue";

interface Props {
  infosMap: Map<RegNumber, ApiSponsorDeskAddInfo>;
  attendeeInfos: TransformedAttendeeInfo[];
}
const props = defineProps<Props>();

const noLegendOptions = { plugins: { legend: { display: false } } };

const tshirtTypeLabelMap = new Map(metadataListForTShirtTypesInternal.map((info) => [info.value, info.label]));

const tshirtCounts = computed(() => {
  const issuedCount: Record<string, number> = {};
  const reservedCount: Record<string, number> = {};
  const owedCount: Record<string, number> = {};
  for (const { issuedItems, reservedItems } of props.infosMap.values()) {
    for (const item of issuedItems || []) if (item.startsWith("tshirt")) issuedCount[item] = (issuedCount[item] || 0) + 1;
    for (const item of reservedItems || []) if (item.startsWith("tshirt")) reservedCount[item] = (reservedCount[item] || 0) + 1;
  }
  for (const attendee of props.attendeeInfos) {
    const sponsorInfo = attendee.id === null ? getEmptySponsorDeskAddInfo() : props.infosMap.get(attendee.id) ?? getEmptySponsorDeskAddInfo();
    for (const item of getOwedConcreteItems(attendee, sponsorInfo))
      if (item.startsWith("tshirt")) owedCount[item] = (owedCount[item] || 0) + 1;
  }
  return { issuedCount, reservedCount, owedCount };
});

function tshirtPieData(counts: Record<string, number>) {
  const keys = Object.keys(counts).filter((k) => counts[k]! > 0).sort();
  return {
    labels: keys.map((key) => tshirtTypeLabelMap.get(key.slice(key.lastIndexOf("_") + 1) as TShirtTypeValue) ?? key),
    datasets: [{ data: keys.map((k) => counts[k]) }],
  };
}
</script>
