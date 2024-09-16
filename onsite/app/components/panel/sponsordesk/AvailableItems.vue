<template>
  <Toast :group="toastGroup" position="bottom-right" />
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
import type { ConcreteTrinketValue, TrinketConfig } from "@/setupEFIteration";
import type {
  ApiAllSponsorDeskAddInfo,
  ApiSponsorDeskAddInfo,
} from "@/types/external";
import type {
  LabeledValue,
  TransformedAttendeeInfo,
  TrinketTreeNode,
} from "@/types/internal";
import type { ToastServiceMethods } from "primevue/toastservice";
import type { ModelRef } from "vue";
import type { WritableComputedRef } from "vue";

const toast: ToastServiceMethods = useToast();

const isLoadingSponsorStats = ref(false);

interface SponsorStats {
  rawData: ApiAllSponsorDeskAddInfo;
  allServedAttendees: number[];
  allIssuedItems: string[];
  allPastItems: string[];
  allReservedItems: string[];
  allOwedItems: string[];
}

const sponsorStatsRef: Ref<SponsorStats | null> = ref<SponsorStats | null>(
  null
);

function compileStats(
  allSponsorInfo: ApiAllSponsorDeskAddInfo,
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
  const errorHandler: RestErrorHandler = getErrorHandlerFunction(
    toast,
    toastGroup
  );
  const allSponsorDeskAddInfos: ApiAllSponsorDeskAddInfo | null =
    await attendeeService.getAllSponsorDeskAddInfos(errorHandler);
  const allAttendes: TransformedAttendeeInfo[] =
    (await attendeeService.getAllAttendees(errorHandler)) || [];
  if (allSponsorDeskAddInfos !== null) {
    sponsorStatsRef.value = compileStats(allSponsorDeskAddInfos, allAttendes);
  }
  nodesRef.value = getTrinketTree(props.allTrinketItems);
  isLoadingSponsorStats.value = false;
});

function lookupStats(node: TrinketTreeNode): TrinketTreeNode {
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

function getTrinketVariantNode(
  trinketConfig: TrinketConfig,
  variantConfig: LabeledValue<string>
): TrinketTreeNode {
  return lookupStats({
    key: getConcreteVariantItemValue(trinketConfig, variantConfig),
    data: variantConfig,
  });
}

function getTrinketNode(trinketConfig: TrinketConfig): TrinketTreeNode {
  const headConcreteTrinketValue: ConcreteTrinketValue = getConcreteItemValue(
    trinketConfig,
    null
  );
  if (trinketConfig.variants === undefined) {
    return lookupStats({
      key: headConcreteTrinketValue,
      data: trinketConfig,
    });
  }
  const variantChildren: TrinketTreeNode[] =
    trinketConfig?.variants?.map((variantConfig: LabeledValue<string>) =>
      getTrinketVariantNode(trinketConfig, variantConfig)
    ) || [];
  function sumStats(statAccess: (entry: TrinketTreeNode) => number): number {
    return variantChildren
      .map((entry: TrinketTreeNode) => statAccess(entry))
      .reduce((a: number, b: number) => a + b, 0);
  }
  return {
    key: headConcreteTrinketValue,
    data: {
      ...trinketConfig,
      ...{
        issuedCount: sumStats(
          (entry: TrinketTreeNode) => entry.data.issuedCount || 0
        ),
        reservedCount: sumStats(
          (entry: TrinketTreeNode) => entry.data.reservedCount || 0
        ),
        reservedIssuedCount: sumStats(
          (entry: TrinketTreeNode) => entry.data.reservedIssuedCount || 0
        ),
        plannedCount: sumStats(
          (entry: TrinketTreeNode) => entry.data.plannedCount || 0
        ),
      },
    },
    children: variantChildren,
  };
}

function getTrinketTree(trinketConfigList: TrinketConfig[]): TrinketTreeNode[] {
  return trinketConfigList.map(getTrinketNode);
}

interface Props {
  allTrinketItems: TrinketConfig[];
}
const props: Props = defineProps<Props>();
const availableItemsRef: ModelRef<ConcreteTrinketValue[]> = defineModel<
  ConcreteTrinketValue[]
>({
  required: true,
});
const availableItemsAsCheckedDataRef: WritableComputedRef<CheckedData> =
  computeAvailableItemsAsCheckedData(availableItemsRef, props.allTrinketItems);

const nodesRef: Ref<TrinketTreeNode[]> = ref<TrinketTreeNode[]>(
  getTrinketTree(props.allTrinketItems)
);
const componentId: string = generateId(useId());
const toastGroup: string = `availableItemsToast${componentId}`;
</script>
