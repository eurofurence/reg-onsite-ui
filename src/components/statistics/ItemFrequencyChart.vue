<template>
  <div class="flex flex-col w-full items-center justify-center gap-2">
    <div class="flex items-center justify-center gap-2 mb-1">
      <label>Item Frequencies</label>
      <Button
        size="small"
        :outlined="!settingsRef.logScaleFrequency"
        v-tooltip.top="'Toggle log scale'"
        @click="settingsRef.logScaleFrequency = !settingsRef.logScaleFrequency"
        >log</Button
      >
      <Button
        size="small"
        outlined
        v-tooltip.top="'Reset to defaults'"
        @click="resetSettings"
        >Reset</Button
      >
      <Button
        v-if="selectedSeriesLabelRef !== null"
        size="small"
        severity="secondary"
        icon="pi pi-filter-slash"
        v-tooltip.top="'Clear bar filter'"
        @click="selectedSeriesLabelRef = null"
      >
        {{ selectedSeriesLabelRef }}
      </Button>
    </div>
    <div class="flex flex-wrap gap-2 items-start justify-center mb-2">
      <Fieldset
        legend="Goodie Categories"
        class="p-2 flex flex-col justify-center h-20"
      >
        <div class="flex flex-wrap items-center justify-center gap-4">
          <div
            v-for="category of goodieCategoryOptions"
            :key="category.value"
            class="flex items-center gap-2"
          >
            <Checkbox
              v-model="settingsRef.selectedGoodieCategories"
              :value="category.value"
              :inputId="`goodie-category-${category.value}`"
            />
            <label
              :for="`goodie-category-${category.value}`"
              class="cursor-pointer"
              >{{ category.label }}</label
            >
          </div>
        </div>
      </Fieldset>
      <Fieldset
        legend="Item Types"
        class="p-2 flex flex-col justify-center h-20"
      >
        <div class="flex flex-wrap items-center justify-center gap-4">
          <div class="flex items-center gap-2">
            <Checkbox
              v-model="settingsRef.includeOther"
              binary
              inputId="item-type-other"
            />
            <label for="item-type-other" class="cursor-pointer">Other</label>
          </div>
          <div class="flex items-center gap-2">
            <Checkbox
              v-model="settingsRef.includeTShirts"
              binary
              inputId="item-type-tshirts"
            />
            <label for="item-type-tshirts" class="cursor-pointer"
              >T-Shirts</label
            >
          </div>
          <SelectButton
            v-model="settingsRef.tshirtDisplayMode"
            :options="tshirtDisplayModeOptions"
            optionLabel="label"
            optionValue="value"
            :allowEmpty="false"
            :disabled="!settingsRef.includeTShirts"
          />
        </div>
      </Fieldset>
    </div>
    <div class="flex flex-grow w-full items-center justify-center">
      <Chart
        type="bar"
        :data="chartData"
        :options="frequencyChartOptions"
        class="w-full h-full inset-0 cursor-pointer"
        @select="handleChartSelect"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import {
  buildItemTree,
  flattenLeafNodes,
  getGoodieCategory,
  GoodieCategory,
} from "@/composables/items/buildItemTreeNodes";
import { useSmartCookie } from "@/composables/useSmartCookie";
import type { AbstractGoodieValue } from "@/config/convention";
import { TShirtShape } from "@/config/metadata/tshirt/metadataForTShirtShapes";
import {
  metadataRecordForTShirtSizes,
  TShirtSize,
} from "@/config/metadata/tshirt/metadataForTShirtSizes";
import {
  metadataListForTShirtTypesInternal,
  type TShirtTypeValue,
} from "@/config/metadata/tshirt/metadataForTShirtTypes";
import type { ApiSponsorDeskAddInfo } from "@/types/external/attsrv/additional-info/sponsordesk";
import type { RegNumber } from "@/types/external/attsrv/attendees/attendee";
import type { TransformedAttendeeInfo } from "@/types/internal/attendee";
import type { GoodieTreeNode } from "@/types/internal/goodies";
import Button from "@/volt/Button.vue";
import Checkbox from "@/volt/Checkbox.vue";
import Fieldset from "@/volt/Fieldset.vue";
import SelectButton from "@/volt/SelectButton.vue";
import type { ActiveElement } from "chart.js";
import Chart from "primevue/chart";
import { computed, ref, type ComputedRef, type Ref } from "vue";

interface Props {
  infosMap: Map<RegNumber, ApiSponsorDeskAddInfo>;
  attendeeInfos: TransformedAttendeeInfo[];
  soldCount?: Record<string, number>;
  inventoryCount?: Record<string, number>;
}
const props = defineProps<Props>();

const enum TShirtDisplayMode {
  total = "total",
  bySize = "bySize",
  byType = "byType",
  bySizeAndType = "bySizeAndType",
}

interface FrequencyChartSettings {
  logScaleFrequency: boolean;
  selectedGoodieCategories: GoodieCategory[];
  includeOther: boolean;
  includeTShirts: boolean;
  tshirtDisplayMode: TShirtDisplayMode;
}

const defaultSettings: FrequencyChartSettings = {
  logScaleFrequency: false,
  selectedGoodieCategories: [
    GoodieCategory.sponsorLevel,
    GoodieCategory.flag,
    GoodieCategory.other,
    GoodieCategory.past,
  ],
  includeOther: true,
  includeTShirts: true,
  tshirtDisplayMode: TShirtDisplayMode.total,
};

const settingsRef = useSmartCookie(
  "itemFrequencyChartSettings",
  defaultSettings,
);

function resetSettings(): void {
  settingsRef.value = defaultSettings;
}

const selectedSeriesLabelRef: Ref<string | null> = ref(null);

function handleChartSelect(event: { element: ActiveElement }): void {
  const label =
    chartData.value.datasets[event.element.datasetIndex]?.label ?? null;
  selectedSeriesLabelRef.value =
    selectedSeriesLabelRef.value === label ? null : label;
}

const frequencyChartOptions = computed(() => ({
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: { labels: { usePointStyle: true } },
    tooltip: {
      callbacks: {
        afterTitle: (items: { dataIndex: number }[]) =>
          `(${sortedLeafNodes.value[items[0]?.dataIndex ?? -1]?.data.value})`,
      },
    },
  },
  scales: {
    y: {
      type: settingsRef.value.logScaleFrequency ? "logarithmic" : "linear",
      ...(settingsRef.value.logScaleFrequency ? { min: 0.1 } : {}),
    },
  },
}));

const tshirtDisplayModeOptions = [
  { label: "Total", value: TShirtDisplayMode.total },
  { label: "By Size", value: TShirtDisplayMode.bySize },
  { label: "By Type", value: TShirtDisplayMode.byType },
  { label: "By Size+Type", value: TShirtDisplayMode.bySizeAndType },
];

function isTShirtNode(node: GoodieTreeNode): boolean {
  return node.data.value.startsWith("tshirt");
}

const tshirtTypeInfoMap = new Map(
  metadataListForTShirtTypesInternal.map((info) => [info.value, info]),
);

const tshirtSizeRank = new Map(
  Object.keys(metadataRecordForTShirtSizes).map((size, index) => [size, index]),
);

function getTShirtVariantValue(node: GoodieTreeNode): TShirtTypeValue {
  return node.data.value.slice(
    node.data.value.lastIndexOf("_") + 1,
  ) as TShirtTypeValue;
}

function getTShirtSizeRank(node: GoodieTreeNode): number {
  const info = tshirtTypeInfoMap.get(getTShirtVariantValue(node));
  return tshirtSizeRank.get(info?.size ?? TShirtSize.size_unknown) ?? -1;
}

const goodieCategoryOptions = [
  { label: "Sponsor Level Goodies", value: GoodieCategory.sponsorLevel },
  { label: "Flag Goodies", value: GoodieCategory.flag },
  { label: "Other Goodies", value: GoodieCategory.other },
  { label: "Past Goodies", value: GoodieCategory.past },
];

const itemTree: ComputedRef<GoodieTreeNode[]> = computed(() =>
  buildItemTree(
    props.infosMap,
    props.attendeeInfos,
    props.soldCount,
    props.inventoryCount,
  ).filter((node) =>
    settingsRef.value.selectedGoodieCategories.includes(
      getGoodieCategory(node.data.value as AbstractGoodieValue),
    ),
  ),
);

function groupTShirtLeafNodes(
  tshirtLeafNodes: GoodieTreeNode[],
): GoodieTreeNode[] {
  const displayMode = settingsRef.value.tshirtDisplayMode;
  if (displayMode === TShirtDisplayMode.total) {
    const total = tshirtLeafNodes.reduce(
      (sum, node) => sum + (node.data.issuedCount ?? 0),
      0,
    );
    return total > 0
      ? [
          {
            key: "abstract:tshirt-total",
            data: {
              value: "tshirt",
              label: "T-Shirts",
              issuedCount: tshirtLeafNodes.reduce(
                (sum, node) => sum + (node.data.issuedCount ?? 0),
                0,
              ),
              reservedCount: tshirtLeafNodes.reduce(
                (sum, node) => sum + (node.data.reservedCount ?? 0),
                0,
              ),
              entitledCount: tshirtLeafNodes.reduce(
                (sum, node) => sum + (node.data.entitledCount ?? 0),
                0,
              ),
              soldCount: tshirtLeafNodes.reduce(
                (sum, node) => sum + (node.data.soldCount ?? 0),
                0,
              ),
              inventoryCount: tshirtLeafNodes.reduce(
                (sum, node) => sum + (node.data.inventoryCount ?? 0),
                0,
              ),
              neededReserveCount: tshirtLeafNodes.reduce(
                (sum, node) => sum + (node.data.neededReserveCount ?? 0),
                0,
              ),
              freeToSellCount: tshirtLeafNodes.reduce(
                (sum, node) => sum + (node.data.freeToSellCount ?? 0),
                0,
              ),
            },
          },
        ]
      : [];
  }

  const groupKeyFor = (node: GoodieTreeNode): string => {
    const variantValue = getTShirtVariantValue(node);
    const info = tshirtTypeInfoMap.get(variantValue);
    if (displayMode === TShirtDisplayMode.bySize)
      return info?.size ?? variantValue;
    if (displayMode === TShirtDisplayMode.byType)
      return info?.shape ?? variantValue;
    return variantValue;
  };
  const labelFor = (node: GoodieTreeNode): string => {
    const variantValue = getTShirtVariantValue(node);
    const info = tshirtTypeInfoMap.get(variantValue);
    if (displayMode === TShirtDisplayMode.bySize)
      return info?.size ?? node.data.label;
    if (displayMode === TShirtDisplayMode.byType)
      return info?.shape === TShirtShape.contoured ? "Contoured" : "Regular";
    return node.data.label;
  };

  const groups = new Map<string, GoodieTreeNode[]>();
  for (const node of tshirtLeafNodes) {
    const groupKey = groupKeyFor(node);
    if (!groups.has(groupKey)) groups.set(groupKey, []);
    groups.get(groupKey)!.push(node);
  }
  return [...groups.entries()]
    .sort(
      ([, nodesA], [, nodesB]) =>
        Math.min(...nodesA.map(getTShirtSizeRank)) -
        Math.min(...nodesB.map(getTShirtSizeRank)),
    )
    .map(([groupKey, nodes]) => ({
      key: `abstract:tshirt-${groupKey}`,
      data: {
        value: `tshirt_${groupKey}`,
        label: labelFor(nodes[0]!),
        issuedCount: nodes.reduce(
          (sum, node) => sum + (node.data.issuedCount ?? 0),
          0,
        ),
        reservedCount: nodes.reduce(
          (sum, node) => sum + (node.data.reservedCount ?? 0),
          0,
        ),
        entitledCount: nodes.reduce(
          (sum, node) => sum + (node.data.entitledCount ?? 0),
          0,
        ),
        soldCount: nodes.reduce(
          (sum, node) => sum + (node.data.soldCount ?? 0),
          0,
        ),
        inventoryCount: nodes.reduce(
          (sum, node) => sum + (node.data.inventoryCount ?? 0),
          0,
        ),
        neededReserveCount: nodes.reduce(
          (sum, node) => sum + (node.data.neededReserveCount ?? 0),
          0,
        ),
        freeToSellCount: nodes.reduce(
          (sum, node) => sum + (node.data.freeToSellCount ?? 0),
          0,
        ),
      },
    }));
}

const leafNodes: ComputedRef<GoodieTreeNode[]> = computed(() => {
  const nonTShirtLeafNodes = settingsRef.value.includeOther
    ? flattenLeafNodes(itemTree.value.filter((node) => !isTShirtNode(node)))
    : [];
  if (!settingsRef.value.includeTShirts) {
    return nonTShirtLeafNodes;
  }
  const tshirtLeafNodes = flattenLeafNodes(itemTree.value.filter(isTShirtNode));
  return [...nonTShirtLeafNodes, ...groupTShirtLeafNodes(tshirtLeafNodes)];
});

const sortedLeafNodes: ComputedRef<GoodieTreeNode[]> = computed(() => {
  const nonTShirtNodes = leafNodes.value
    .filter((node) => !isTShirtNode(node))
    .sort((node1, node2) => node1.data.label.localeCompare(node2.data.label));
  const tshirtNodes = leafNodes.value.filter(isTShirtNode);
  return [...nonTShirtNodes, ...tshirtNodes];
});

const allDatasets = computed(() => {
  const sortedNodes = sortedLeafNodes.value;
  return [
    {
      label: "Issued",
      data: sortedNodes.map((node) => node.data.issuedCount ?? 0),
      backgroundColor: "rgba(75, 192, 192, 0.6)",
    },
    {
      label: "Reserved",
      data: sortedNodes.map((node) => node.data.reservedCount ?? 0),
      backgroundColor: "rgba(255, 159, 64, 0.6)",
    },
    {
      label: "Entitled",
      data: sortedNodes.map((node) => node.data.entitledCount ?? 0),
      backgroundColor: "rgba(255, 205, 86, 0.6)",
    },
    {
      label: "Sold",
      data: sortedNodes.map((node) => node.data.soldCount ?? 0),
      backgroundColor: "rgba(153, 102, 255, 0.6)",
    },
    {
      label: "Inventory",
      data: sortedNodes.map((node) => node.data.inventoryCount ?? 0),
      backgroundColor: "rgba(54, 162, 235, 0.6)",
    },
    {
      label: "Needed Reserve",
      data: sortedNodes.map((node) => node.data.neededReserveCount ?? 0),
      backgroundColor: "rgba(255, 99, 132, 0.6)",
    },
    {
      label: "Free to Sell",
      data: sortedNodes.map((node) => node.data.freeToSellCount ?? 0),
      backgroundColor: "rgba(201, 203, 207, 0.6)",
    },
  ];
});

const chartData = computed(() => ({
  labels: sortedLeafNodes.value.map((node) => node.data.label),
  datasets:
    selectedSeriesLabelRef.value === null
      ? allDatasets.value
      : allDatasets.value.filter(
          (dataset) => dataset.label === selectedSeriesLabelRef.value,
        ),
}));
</script>
