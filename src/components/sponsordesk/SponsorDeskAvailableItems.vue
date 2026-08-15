<template>
  <Toast :group="toastService.toastGroup" position="bottom-right" />
  <div>
    <div class="pb-1" v-if="isLoadingSponsorStats">
      <ProgressBar mode="indeterminate"></ProgressBar>
    </div>
    <GoodieTreeTable
      :nodes="nodesRef"
      :columns="columns"
      showCheckboxes
      v-model:selectedItems="availableItemsRef"
    />
  </div>
</template>

<script setup lang="ts">
import GoodieTreeTable, { type ColumnDef } from "@/components/items/GoodieTreeTable.vue";
import { getErrorHandlerFunction } from "@/composables/api/base/getErrorHandlerFunction";
import type { RestErrorHandler } from "@/composables/api/base/restErrorWrapper";
import { generateId } from "@/composables/generateId";
import { getConcreteItemValue } from "@/composables/items/getConcreteItemValue";
import { getConcreteVariantItemValue } from "@/composables/items/getConcreteVariantItemValue";
import { accumulateItemCounts, type ItemCounts } from "@/composables/items/buildItemTreeNodes";
import { getSponsorDeskConfigCounts } from "@/composables/items/getSponsorDeskConfigCounts";
import { attendeeService } from "@/composables/services/attendeeService";
import { OnsiteToastService } from "@/composables/services/toastService";
import type { ConcreteGoodieValue, GoodieConfig } from "@/config/convention";
import type { GoodieTreeNode } from "@/types/internal/goodies";
import type { LabeledValue } from "@/types/internal/infos";
import ProgressBar from "@/volt/ProgressBar.vue";
import Toast from "@/volt/Toast.vue";
import type { ModelRef } from "vue";
import { onMounted, ref, useId, type Ref } from "vue";

const isLoadingSponsorStats = ref(false);

const itemCountsRef: Ref<ItemCounts | null> = ref<ItemCounts | null>(null);

onMounted(async () => {
  isLoadingSponsorStats.value = true;
  const errorHandler: RestErrorHandler = getErrorHandlerFunction(toastService);
  const [allSponsorDeskAddInfos, allAttendes, configCounts] = await Promise.all([
    attendeeService.addInfos.getAllSponsorDeskAddInfos(errorHandler),
    attendeeService.getAllAttendees(errorHandler),
    getSponsorDeskConfigCounts(errorHandler),
  ]);
  if (allSponsorDeskAddInfos !== undefined) {
    itemCountsRef.value = accumulateItemCounts(
      allSponsorDeskAddInfos.infos,
      allAttendes ?? [],
      configCounts.soldCount,
      configCounts.inventoryCount
    );
  }
  nodesRef.value = getGoodieTree(props.allGoodieItems);
  isLoadingSponsorStats.value = false;
});

function lookupStats(node: GoodieTreeNode): GoodieTreeNode {
  if (itemCountsRef.value !== null) {
    const counts = itemCountsRef.value;
    node.data.issuedCount = counts.issuedCount[node.key] ?? 0;
    node.data.reservedCount = counts.reservedCount[node.key] ?? 0;
    node.data.entitledCount = counts.entitledCount[node.key] ?? 0;
    node.data.soldCount = counts.soldCount[node.key] ?? 0;
    node.data.inventoryCount = counts.inventoryCount[node.key] ?? 0;
    node.data.neededReserveCount = counts.neededReserveCount[node.key] ?? 0;
    node.data.freeToSellCount = Math.max(0, node.data.inventoryCount - node.data.soldCount - (counts.heldCount[node.key] ?? 0));
  }
  return node;
}

function getGoodieVariantNode(goodieConfig: GoodieConfig, variantConfig: LabeledValue<string>): GoodieTreeNode {
  return lookupStats({ key: getConcreteVariantItemValue(goodieConfig, variantConfig), data: variantConfig });
}

function getGoodieNode(goodieConfig: GoodieConfig): GoodieTreeNode {
  const headConcreteGoodieValue: ConcreteGoodieValue = getConcreteItemValue(goodieConfig, null);
  if (goodieConfig.variants === undefined) {
    return lookupStats({ key: headConcreteGoodieValue, data: goodieConfig });
  }
  const variantChildren: GoodieTreeNode[] =
    goodieConfig?.variants?.map((variantConfig: LabeledValue<string>) => getGoodieVariantNode(goodieConfig, variantConfig)) || [];
  function sumStats(statAccess: (entry: GoodieTreeNode) => number): number {
    return variantChildren.map((entry: GoodieTreeNode) => statAccess(entry)).reduce((a: number, b: number) => a + b, 0);
  }
  return {
    key: headConcreteGoodieValue,
    data: {
      ...goodieConfig,
      issuedCount: sumStats((entry: GoodieTreeNode) => entry.data.issuedCount || 0),
      reservedCount: sumStats((entry: GoodieTreeNode) => entry.data.reservedCount || 0),
      entitledCount: sumStats((entry: GoodieTreeNode) => entry.data.entitledCount || 0),
      soldCount: sumStats((entry: GoodieTreeNode) => entry.data.soldCount || 0),
      inventoryCount: sumStats((entry: GoodieTreeNode) => entry.data.inventoryCount || 0),
      neededReserveCount: sumStats((entry: GoodieTreeNode) => entry.data.neededReserveCount || 0),
      freeToSellCount: sumStats((entry: GoodieTreeNode) => entry.data.freeToSellCount || 0),
    },
    children: variantChildren,
  };
}

function getGoodieTree(goodieConfigList: GoodieConfig[]): GoodieTreeNode[] {
  return goodieConfigList.map(getGoodieNode);
}

interface Props { allGoodieItems: GoodieConfig[]; }
const props: Props = defineProps<Props>();
const availableItemsRef: ModelRef<ConcreteGoodieValue[]> = defineModel<ConcreteGoodieValue[]>({ required: true });
const nodesRef: Ref<GoodieTreeNode[]> = ref<GoodieTreeNode[]>(getGoodieTree(props.allGoodieItems));
const componentId: string = generateId(useId());
const toastService: OnsiteToastService = new OnsiteToastService(componentId);

const columns: ColumnDef[] = [
  { field: "issuedCount", header: "Issued" },
  { field: "reservedCount", header: "Reserved" },
  { field: "entitledCount", header: "Entitled" },
  { field: "soldCount", header: "Sold" },
  { field: "inventoryCount", header: "Inventory" },
  { field: "neededReserveCount", header: "Needed Reserve" },
  { field: "freeToSellCount", header: "Free to Sell" },
];
</script>
