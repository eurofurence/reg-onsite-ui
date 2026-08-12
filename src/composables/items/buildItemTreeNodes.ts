import { getConcreteItemsForGoodie } from "@/composables/items/getConcreteItemsForGoodie";
import { getOwedConcreteItems } from "@/composables/items/getOwedConcreteItems";
import { getConventionSetup } from "@/composables/logic/getConventionSetup";
import { getEmptySponsorDeskAddInfo } from "@/composables/services/attendee/getEmptySponsorDeskAddInfo";
import type { GoodieConfig } from "@/config/convention";
import type { ApiSponsorDeskAddInfo } from "@/types/external/attsrv/additional-info/sponsordesk";
import type { RegNumber } from "@/types/external/attsrv/attendees/attendee";
import type { TransformedAttendeeInfo } from "@/types/internal/attendee";
import type { GoodieTreeNode } from "@/types/internal/goodies";
import type { LabeledValue } from "@/types/internal/infos";

export interface ItemCounts {
  issuedCount: Record<string, number>;
  reservedCount: Record<string, number>;
  boughtCount: Record<string, number>;
}

export function accumulateItemCounts(
  infosMap: Map<RegNumber, ApiSponsorDeskAddInfo>,
  attendeeInfos: TransformedAttendeeInfo[],
): ItemCounts {
  const issuedCount: Record<string, number> = {};
  const reservedCount: Record<string, number> = {};
  const boughtCount: Record<string, number> = {};
  for (const { issuedItems, reservedItems } of infosMap.values()) {
    for (const item of issuedItems || []) issuedCount[item] = (issuedCount[item] || 0) + 1;
    for (const item of reservedItems || []) reservedCount[item] = (reservedCount[item] || 0) + 1;
  }
  for (const attendee of attendeeInfos) {
    const sponsorInfo = attendee.id === null ? getEmptySponsorDeskAddInfo() : infosMap.get(attendee.id) ?? getEmptySponsorDeskAddInfo();
    for (const item of getOwedConcreteItems(attendee, sponsorInfo))
      boughtCount[item] = (boughtCount[item] || 0) + 1;
  }
  return { issuedCount, reservedCount, boughtCount };
}

function makeLeafNode(key: string, label: string, counts: ItemCounts): GoodieTreeNode {
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

function makeVariantNodes(goodieConfig: GoodieConfig, counts: ItemCounts): GoodieTreeNode[] {
  const concreteItems = getConcreteItemsForGoodie(goodieConfig);
  return (goodieConfig.variants ?? []).map((variant: LabeledValue<string>) => {
    const key = concreteItems.find((c) => c.endsWith(`_${variant.value}`)) ?? concreteItems[0]!;
    return makeLeafNode(key, variant.label, counts);
  });
}

function makeParentNode(goodieConfig: GoodieConfig, children: GoodieTreeNode[]): GoodieTreeNode {
  return {
    key: getConcreteItemsForGoodie(goodieConfig)[0]!,
    data: {
      value: goodieConfig.value,
      label: goodieConfig.label,
      issuedCount: children.reduce((s, c) => s + (c.data.issuedCount ?? 0), 0),
      reservedCount: children.reduce((s, c) => s + (c.data.reservedCount ?? 0), 0),
      boughtCount: children.reduce((s, c) => s + (c.data.boughtCount ?? 0), 0),
    },
    children,
  };
}

function goodieConfigToTreeNode(goodieConfig: GoodieConfig, counts: ItemCounts): GoodieTreeNode {
  if (goodieConfig.variants == null)
    return makeLeafNode(getConcreteItemsForGoodie(goodieConfig)[0]!, goodieConfig.label, counts);
  return makeParentNode(goodieConfig, makeVariantNodes(goodieConfig, counts));
}

export function buildItemTree(
  infosMap: Map<RegNumber, ApiSponsorDeskAddInfo>,
  attendeeInfos: TransformedAttendeeInfo[],
): GoodieTreeNode[] {
  const counts = accumulateItemCounts(infosMap, attendeeInfos);
  return getConventionSetup()
    .metadata.forAbstractGoodies.list.map((g: GoodieConfig) => goodieConfigToTreeNode(g, counts))
    .filter((n) => (n.data.issuedCount ?? 0) + (n.data.reservedCount ?? 0) + (n.data.boughtCount ?? 0) > 0);
}
