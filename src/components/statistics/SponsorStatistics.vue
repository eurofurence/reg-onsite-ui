<template>
  <div class="flex flex-col gap-8">
    <div class="flex flex-wrap gap-5 place-content-center">
      <div class="grid-cols-1">
        <label class="flex justify-center">Item Frequencies</label>
        <Chart
          type="bar"
          :data="generateFrequencyChartDataFromMap(modelValue.infos, props.attendeeInfos)"
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

    <div class="flex flex-col gap-2">
      <div class="flex justify-end">
        <Button
          class="h-10 aspect-square"
          v-tooltip.bottom="'Export as CSV'"
          @click="exportItemTreeAsCSV"
        >
          <i class="pi pi-external-link" />
        </Button>
      </div>
      <TreeTable :value="itemTreeNodes" class="w-full">
        <Column field="label" header="Item" expander />
        <Column field="issuedCount" header="Issued" />
        <Column field="reservedCount" header="Reserved" />
        <Column field="boughtCount" header="Bought" />
      </TreeTable>
    </div>
  </div>
</template>

<script setup lang="ts">
import { getConcreteItemsForGoodie } from "@/composables/items/getConcreteItemsForGoodie";
import { getOwedConcreteItems } from "@/composables/items/getOwedConcreteItems";
import { getConventionSetup } from "@/composables/logic/getConventionSetup";
import { downloadCSV } from "@/composables/logic/downloadCSV";
import { getEmptySponsorDeskAddInfo } from "@/composables/services/attendee/getEmptySponsorDeskAddInfo";
import type { GoodieConfig } from "@/config/convention";
import type { ApiAllAddInfo } from "@/types/external/attsrv/additional-info/common";
import type { ApiSponsorDeskAddInfo } from "@/types/external/attsrv/additional-info/sponsordesk";
import type { RegNumber } from "@/types/external/attsrv/attendees/attendee";
import type { TransformedAttendeeInfo } from "@/types/internal/attendee";
import type { GoodieTreeNode } from "@/types/internal/goodies";
import type { LabeledValue } from "@/types/internal/infos";
import Button from "@/volt/Button.vue";
import { Column, TreeTable } from "primevue";
import Chart from "primevue/chart";
import { computed, type ComputedRef, type ModelRef } from "vue";

interface Props {
  attendeeInfos: TransformedAttendeeInfo[];
}
const props = defineProps<Props>();

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
  infosMap: Map<RegNumber, ApiSponsorDeskAddInfo>,
  attendeeInfos: TransformedAttendeeInfo[]
) {
  const issuedCount: Record<string, number> = {};
  const reservedCount: Record<string, number> = {};
  const boughtCount: Record<string, number> = {};

  for (const { issuedItems, reservedItems } of infosMap.values()) {
    for (const item of issuedItems || []) {
      issuedCount[item] = (issuedCount[item] || 0) + 1;
    }
    for (const item of reservedItems || []) {
      reservedCount[item] = (reservedCount[item] || 0) + 1;
    }
  }

  for (const attendee of attendeeInfos) {
    const sponsorInfo: ApiSponsorDeskAddInfo =
      attendee.id === null
        ? getEmptySponsorDeskAddInfo()
        : infosMap.get(attendee.id) ?? getEmptySponsorDeskAddInfo();
    for (const item of getOwedConcreteItems(attendee, sponsorInfo)) {
      boughtCount[item] = (boughtCount[item] || 0) + 1;
    }
  }

  const allItems = [
    ...new Set([
      ...Object.keys(issuedCount),
      ...Object.keys(reservedCount),
      ...Object.keys(boughtCount),
    ]),
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
      {
        label: "Bought Items",
        data: allItems.map((item) => boughtCount[item] || 0),
        backgroundColor: "rgba(153, 102, 255, 0.6)",
      },
    ],
  };
}

interface ItemCounts {
  issuedCount: Record<string, number>;
  reservedCount: Record<string, number>;
  boughtCount: Record<string, number>;
}

function accumulateItemCounts(
  infosMap: Map<RegNumber, ApiSponsorDeskAddInfo>,
  attendeeInfos: TransformedAttendeeInfo[]
): ItemCounts {
  const issuedCount: Record<string, number> = {};
  const reservedCount: Record<string, number> = {};
  const boughtCount: Record<string, number> = {};

  for (const { issuedItems, reservedItems } of infosMap.values()) {
    for (const item of issuedItems || []) {
      issuedCount[item] = (issuedCount[item] || 0) + 1;
    }
    for (const item of reservedItems || []) {
      reservedCount[item] = (reservedCount[item] || 0) + 1;
    }
  }
  for (const attendee of attendeeInfos) {
    const sponsorInfo: ApiSponsorDeskAddInfo =
      attendee.id === null
        ? getEmptySponsorDeskAddInfo()
        : infosMap.get(attendee.id) ?? getEmptySponsorDeskAddInfo();
    for (const item of getOwedConcreteItems(attendee, sponsorInfo)) {
      boughtCount[item] = (boughtCount[item] || 0) + 1;
    }
  }
  return { issuedCount, reservedCount, boughtCount };
}

function makeLeafNode(
  key: string,
  label: string,
  counts: ItemCounts
): GoodieTreeNode {
  return {
    key: key as GoodieTreeNode["key"],
    data: {
      value: key,
      label,
      issuedCount: counts.issuedCount[key] || 0,
      reservedCount: counts.reservedCount[key] || 0,
      boughtCount: counts.boughtCount[key] || 0,
    },
  };
}

function makeVariantNodes(
  goodieConfig: GoodieConfig,
  counts: ItemCounts
): GoodieTreeNode[] {
  const concreteItems = getConcreteItemsForGoodie(goodieConfig);
  return (goodieConfig.variants ?? []).map((variant: LabeledValue<string>) => {
    const key =
      concreteItems.find((c) => c.endsWith(`_${variant.value}`)) ??
      concreteItems[0];
    return makeLeafNode(key, variant.label, counts);
  });
}

function makeParentNode(
  goodieConfig: GoodieConfig,
  children: GoodieTreeNode[]
): GoodieTreeNode {
  return {
    key: getConcreteItemsForGoodie(goodieConfig)[0],
    data: {
      value: goodieConfig.value,
      label: goodieConfig.label,
      issuedCount: children.reduce((s, c) => s + (c.data.issuedCount ?? 0), 0),
      reservedCount: children.reduce(
        (s, c) => s + (c.data.reservedCount ?? 0),
        0
      ),
      boughtCount: children.reduce((s, c) => s + (c.data.boughtCount ?? 0), 0),
    },
    children,
  };
}

function hasAnyCount(node: GoodieTreeNode): boolean {
  const ownTotal =
    (node.data.issuedCount ?? 0) +
    (node.data.reservedCount ?? 0) +
    (node.data.boughtCount ?? 0);
  return ownTotal > 0;
}

function goodieConfigToTreeNode(
  goodieConfig: GoodieConfig,
  counts: ItemCounts
): GoodieTreeNode {
  if (goodieConfig.variants === undefined || goodieConfig.variants === null) {
    return makeLeafNode(
      getConcreteItemsForGoodie(goodieConfig)[0],
      goodieConfig.label,
      counts
    );
  }
  return makeParentNode(goodieConfig, makeVariantNodes(goodieConfig, counts));
}

function buildItemTree(
  infosMap: Map<RegNumber, ApiSponsorDeskAddInfo>,
  attendeeInfos: TransformedAttendeeInfo[]
): GoodieTreeNode[] {
  const counts = accumulateItemCounts(infosMap, attendeeInfos);
  return getConventionSetup()
    .metadata.forAbstractGoodies.list.map((g: GoodieConfig) =>
      goodieConfigToTreeNode(g, counts)
    )
    .filter(hasAnyCount);
}

function exportItemTreeAsCSV(): void {
  const headers = ["Item", "Issued", "Reserved", "Bought"];
  const rows: string[][] = [];
  for (const node of itemTreeNodes.value) {
    rows.push([
      node.data.label,
      String(node.data.issuedCount ?? 0),
      String(node.data.reservedCount ?? 0),
      String(node.data.boughtCount ?? 0),
    ]);
    for (const child of node.children ?? []) {
      rows.push([
        `  ${child.data.label}`,
        String(child.data.issuedCount ?? 0),
        String(child.data.reservedCount ?? 0),
        String(child.data.boughtCount ?? 0),
      ]);
    }
  }
  const csv = [headers, ...rows]
    .map((row) => row.map((cell) => `"${cell.replace(/"/g, '""')}"`).join(";"))
    .join("\n");
  downloadCSV(csv, "inventory.csv");
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

const itemTreeNodes: ComputedRef<GoodieTreeNode[]> = computed(() =>
  buildItemTree(modelValue.value.infos, props.attendeeInfos)
);
</script>
