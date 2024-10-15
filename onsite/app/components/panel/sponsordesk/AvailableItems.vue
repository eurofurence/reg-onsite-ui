<template>
  <Toast :group="toastService.toastGroup" position="bottom-right" />
  <div>
    <div class="pb-1" v-if="isLoadingSponsorStats">
      <ProgressBar mode="indeterminate"></ProgressBar>
    </div>
    <TreeTable
      v-model:value="nodesRef"
      v-model:selectionKeys="availableItemsAsCheckedDataRef"
      selectionMode="checkbox"
    >
      <Column field="label" header="Name" expander> </Column>
      <Column field="issuedCount" header="Issued (all)"></Column>
      <Column field="reservedIssuedCount" header="Issued (reserved)"></Column>
      <Column field="reservedCount" header="Reserved"></Column>
      <Column field="plannedCount" header="Planned"></Column>
    </TreeTable>
  </div>
</template>

<script setup lang="ts">
import { getErrorHandlerFunction } from "@/composables/api/base/getErrorHandlerFunction";
import type { RestErrorHandler } from "@/composables/api/base/restErrorWrapper";
import { computeAvailableItemsAsCheckedData } from "@/composables/items/computeAvailableItemsAsCheckedData";
import type { CheckedData } from "@/composables/items/computeAvailableItemsAsCheckedData";
import { getConcreteItemValue } from "@/composables/items/getConcreteItemValue";
import { getConcreteVariantItemValue } from "@/composables/items/getConcreteVariantItemValue";
import { getEmptySponsorDeskAddInfo } from "@/composables/items/getEmptySponsorDeskAddInfo";
import { getOwedConcreteItems } from "@/composables/items/getOwedConcreteItems";
import { attendeeService } from "@/composables/services/attendeeService";
import type { ModelRef } from "vue";
import type { WritableComputedRef } from "vue";
import type { ApiSponsorDeskAddInfo } from "@/types/external/attsrv/additional-info/sponsordesk";
import type { TransformedAttendeeInfo } from "@/types/internal/attendee";
import type { GoodieTreeNode } from "@/types/internal/goodies";
import type { LabeledValue } from "@/types/internal/infos";
import { OnsiteToastService } from "@/composables/services/toastService";
import type { ApiAllAddInfo } from "@/types/external/attsrv/additional-info/common";
import type { ConcreteGoodieValue, GoodieConfig } from "@/config/convention";
import type { RegNumber } from "@/types/external/attsrv/attendees/attendee";

const isLoadingSponsorStats = ref(false);

interface SponsorStats {
  rawData: ApiAllAddInfo<ApiSponsorDeskAddInfo>;
  allServedAttendees: RegNumber[];
  allIssuedItems: string[];
  allPastItems: string[];
  allReservedItems: string[];
  allOwedItems: string[];
}

const sponsorStatsRef: Ref<SponsorStats | null> = ref<SponsorStats | null>(
  null
);

function compileStats(
  allSponsorInfo: ApiAllAddInfo<ApiSponsorDeskAddInfo>,
  allAttendes: TransformedAttendeeInfo[]
): SponsorStats {
  const emptySponsorInfo: ApiSponsorDeskAddInfo = getEmptySponsorDeskAddInfo();
  const allSponsorValues: ApiSponsorDeskAddInfo[] = Array.from(
    allSponsorInfo.infos.values()
  );
  return {
    rawData: allSponsorInfo,
    allServedAttendees: Array.from(allSponsorInfo.infos.keys()),
    allIssuedItems: allSponsorValues.flatMap(
      (entry: ApiSponsorDeskAddInfo) => entry.issuedItems
    ),
    allPastItems: allSponsorValues.flatMap(
      (entry: ApiSponsorDeskAddInfo) => entry.pastItems
    ),
    allReservedItems: allSponsorValues.flatMap(
      (entry: ApiSponsorDeskAddInfo) => entry.reservedItems
    ),
    allOwedItems: allAttendes.flatMap((attendee: TransformedAttendeeInfo) => {
      const sponsorInfo: ApiSponsorDeskAddInfo =
        attendee.id === null
          ? emptySponsorInfo
          : allSponsorInfo.infos.get(attendee.id) || emptySponsorInfo;
      return getOwedConcreteItems(attendee, sponsorInfo);
    }),
  };
}

onMounted(async () => {
  isLoadingSponsorStats.value = true;
  const errorHandler: RestErrorHandler = getErrorHandlerFunction(toastService);
  const allSponsorDeskAddInfos:
    | ApiAllAddInfo<ApiSponsorDeskAddInfo>
    | undefined = await attendeeService.addInfos.getAllSponsorDeskAddInfos(
    errorHandler
  );
  const allAttendes: TransformedAttendeeInfo[] =
    (await attendeeService.getAllAttendees(errorHandler)) || [];
  if (allSponsorDeskAddInfos !== undefined) {
    sponsorStatsRef.value = compileStats(allSponsorDeskAddInfos, allAttendes);
  }
  nodesRef.value = getGoodieTree(props.allGoodieItems);
  isLoadingSponsorStats.value = false;
});

function lookupStats(node: GoodieTreeNode): GoodieTreeNode {
  function filterIssuedReserved(item: ApiSponsorDeskAddInfo) {
    if (item.issuedItems === undefined || item.reservedItems === undefined) {
      return false;
    }
    return (
      item.issuedItems.includes(node.key) &&
      item.reservedItems.includes(node.key)
    );
  }
  if (sponsorStatsRef.value !== null) {
    node.data.issuedCount = sponsorStatsRef.value.allIssuedItems.filter(
      (key: string) => key == node.key
    ).length;
    node.data.reservedCount = sponsorStatsRef.value.allReservedItems.filter(
      (key: string) => key == node.key
    ).length;
    node.data.reservedIssuedCount = Array.from(
      sponsorStatsRef.value.rawData.infos.values()
    ).filter(filterIssuedReserved).length;
    const allPlannedItems = [
      sponsorStatsRef.value.allPastItems,
      sponsorStatsRef.value.allOwedItems,
    ].flat();
    node.data.plannedCount = allPlannedItems.filter(
      (key: string) => key == node.key
    ).length;
  }
  return node;
}

function getGoodieVariantNode(
  goodieConfig: GoodieConfig,
  variantConfig: LabeledValue<string>
): GoodieTreeNode {
  return lookupStats({
    key: getConcreteVariantItemValue(goodieConfig, variantConfig),
    data: variantConfig,
  });
}

function getGoodieNode(goodieConfig: GoodieConfig): GoodieTreeNode {
  const headConcreteGoodieValue: ConcreteGoodieValue = getConcreteItemValue(
    goodieConfig,
    null
  );
  if (goodieConfig.variants === undefined) {
    return lookupStats({
      key: headConcreteGoodieValue,
      data: goodieConfig,
    });
  }
  const variantChildren: GoodieTreeNode[] =
    goodieConfig?.variants?.map((variantConfig: LabeledValue<string>) =>
      getGoodieVariantNode(goodieConfig, variantConfig)
    ) || [];
  function sumStats(statAccess: (entry: GoodieTreeNode) => number): number {
    return variantChildren
      .map((entry: GoodieTreeNode) => statAccess(entry))
      .reduce((a: number, b: number) => a + b, 0);
  }
  return {
    key: headConcreteGoodieValue,
    data: {
      ...goodieConfig,
      ...{
        issuedCount: sumStats(
          (entry: GoodieTreeNode) => entry.data.issuedCount || 0
        ),
        reservedCount: sumStats(
          (entry: GoodieTreeNode) => entry.data.reservedCount || 0
        ),
        reservedIssuedCount: sumStats(
          (entry: GoodieTreeNode) => entry.data.reservedIssuedCount || 0
        ),
        plannedCount: sumStats(
          (entry: GoodieTreeNode) => entry.data.plannedCount || 0
        ),
      },
    },
    children: variantChildren,
  };
}

function getGoodieTree(goodieConfigList: GoodieConfig[]): GoodieTreeNode[] {
  return goodieConfigList.map(getGoodieNode);
}

interface Props {
  allGoodieItems: GoodieConfig[];
}
const props: Props = defineProps<Props>();
const availableItemsRef: ModelRef<ConcreteGoodieValue[]> = defineModel<
  ConcreteGoodieValue[]
>({
  required: true,
});
const availableItemsAsCheckedDataRef: WritableComputedRef<CheckedData> =
  computeAvailableItemsAsCheckedData(availableItemsRef, props.allGoodieItems);

const nodesRef: Ref<GoodieTreeNode[]> = ref<GoodieTreeNode[]>(
  getGoodieTree(props.allGoodieItems)
);
const componentId: string = generateId(useId());
const toastService: OnsiteToastService = new OnsiteToastService(componentId);
</script>
