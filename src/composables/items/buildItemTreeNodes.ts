import { getConcreteItemsEntitlement } from "@/composables/items/getConcreteItemsEntitlement";
import { getConcreteItemsForGoodie } from "@/composables/items/getConcreteItemsForGoodie";
import { getConventionSetup } from "@/composables/logic/getConventionSetup";
import { getEmptySponsorDeskAddInfo } from "@/composables/services/attendee/getEmptySponsorDeskAddInfo";
import type { AbstractGoodieValue, GoodieConfig } from "@/config/convention";
import type { ApiSponsorDeskAddInfo } from "@/types/external/attsrv/additional-info/sponsordesk";
import type { RegNumber } from "@/types/external/attsrv/attendees/attendee";
import type { TransformedAttendeeInfo } from "@/types/internal/attendee";
import type { GoodieTreeNode } from "@/types/internal/goodies";
import type { LabeledValue } from "@/types/internal/infos";

export interface ItemCounts {
  issuedCount: Record<string, number>;
  reservedCount: Record<string, number>;
  entitledCount: Record<string, number>;
  soldCount: Record<string, number>;
  inventoryCount: Record<string, number>;
  neededReserveCount: Record<string, number>;
  heldCount: Record<string, number>;
}

function countByItem(items: string[]): Record<string, number> {
  const counts: Record<string, number> = {};
  for (const item of items) counts[item] = (counts[item] || 0) + 1;
  return counts;
}

export function accumulateItemCounts(
  infosMap: Map<RegNumber, ApiSponsorDeskAddInfo>,
  attendeeInfos: TransformedAttendeeInfo[],
  soldCount: Record<string, number> = {},
  inventoryCount: Record<string, number> = {},
): ItemCounts {
  const issuedCount: Record<string, number> = {};
  const reservedCount: Record<string, number> = {};
  const entitledCount: Record<string, number> = {};
  const neededReserveCount: Record<string, number> = {};
  const heldCount: Record<string, number> = {};
  for (const { issuedItems, reservedItems } of infosMap.values()) {
    const attendeeIssuedCount = countByItem(issuedItems || []);
    const attendeeReservedCount = countByItem(reservedItems || []);
    for (const item of issuedItems || []) issuedCount[item] = (issuedCount[item] || 0) + 1;
    for (const item of reservedItems || []) reservedCount[item] = (reservedCount[item] || 0) + 1;
    for (const item of new Set([...(issuedItems || []), ...(reservedItems || [])])) {
      const attendeeIssued = attendeeIssuedCount[item] || 0;
      const attendeeReserved = attendeeReservedCount[item] || 0;
      const attendeeNeededReserve = attendeeReserved - attendeeIssued;
      if (attendeeNeededReserve > 0)
        neededReserveCount[item] = (neededReserveCount[item] || 0) + attendeeNeededReserve;
      heldCount[item] = (heldCount[item] || 0) + Math.max(attendeeIssued, attendeeReserved);
    }
  }
  for (const attendee of attendeeInfos) {
    const sponsorInfo = attendee.id === null ? getEmptySponsorDeskAddInfo() : infosMap.get(attendee.id) ?? getEmptySponsorDeskAddInfo();
    for (const item of getConcreteItemsEntitlement(attendee, sponsorInfo))
      entitledCount[item] = (entitledCount[item] || 0) + 1;
  }
  return { issuedCount, reservedCount, entitledCount, soldCount, inventoryCount, neededReserveCount, heldCount };
}

export function getFreeToSellCountForItem(key: string, counts: ItemCounts): number {
  const soldCount = counts.soldCount[key] || 0;
  const inventoryCount = counts.inventoryCount[key] || 0;
  const heldCount = counts.heldCount[key] || 0;
  return Math.max(0, inventoryCount - soldCount - heldCount);
}

function makeLeafNode(key: string, label: string, counts: ItemCounts): GoodieTreeNode {
  const issuedCount = counts.issuedCount[key] || 0;
  const reservedCount = counts.reservedCount[key] || 0;
  const soldCount = counts.soldCount[key] || 0;
  const inventoryCount = counts.inventoryCount[key] || 0;
  return {
    key: key as GoodieTreeNode["key"],
    data: {
      value: key,
      label,
      issuedCount,
      reservedCount,
      entitledCount: counts.entitledCount[key] || 0,
      soldCount,
      inventoryCount,
      neededReserveCount: counts.neededReserveCount[key] || 0,
      freeToSellCount: getFreeToSellCountForItem(key, counts),
    },
  };
}

function makeVariantNodes(goodieConfig: GoodieConfig, counts: ItemCounts): GoodieTreeNode[] {
  const concreteItems = getConcreteItemsForGoodie(goodieConfig);
  return (goodieConfig.variants ?? []).flatMap((variant: LabeledValue<string>) => {
    const key = concreteItems.find((c) => c.endsWith(`_${variant.value}`));
    if (key === undefined) {
      console.error(
        `No concrete item found for variant "${variant.value}" of goodie "${goodieConfig.value}" — variants and getConcreteItemsForGoodie have desynced. Omitting this variant from the item tree.`
      );
      return [];
    }
    return [makeLeafNode(key, variant.label, counts)];
  });
}

function makeParentNode(goodieConfig: GoodieConfig, children: GoodieTreeNode[]): GoodieTreeNode {
  return {
    key: `abstract:${goodieConfig.value}`,
    data: {
      value: goodieConfig.value,
      label: goodieConfig.label,
      issuedCount: children.reduce((s, c) => s + (c.data.issuedCount ?? 0), 0),
      reservedCount: children.reduce((s, c) => s + (c.data.reservedCount ?? 0), 0),
      entitledCount: children.reduce((s, c) => s + (c.data.entitledCount ?? 0), 0),
      soldCount: children.reduce((s, c) => s + (c.data.soldCount ?? 0), 0),
      inventoryCount: children.reduce((s, c) => s + (c.data.inventoryCount ?? 0), 0),
      neededReserveCount: children.reduce((s, c) => s + (c.data.neededReserveCount ?? 0), 0),
      freeToSellCount: children.reduce((s, c) => s + (c.data.freeToSellCount ?? 0), 0),
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
  soldCount: Record<string, number> = {},
  inventoryCount: Record<string, number> = {},
  hideZeroActivity = true,
  hideNotCurrentIteration = true,
): GoodieTreeNode[] {
  const counts = accumulateItemCounts(infosMap, attendeeInfos, soldCount, inventoryCount);
  const conventionSetup = getConventionSetup();
  return conventionSetup.metadata.forAbstractGoodies.list
    .filter((g: GoodieConfig) => !hideNotCurrentIteration || g.value in conventionSetup.currentGoodiesRecord)
    .map((g: GoodieConfig) => goodieConfigToTreeNode(g, counts))
    .filter((n) => !hideZeroActivity || (n.data.issuedCount ?? 0) + (n.data.reservedCount ?? 0) + (n.data.entitledCount ?? 0) > 0);
}

export function flattenLeafNodes(nodes: GoodieTreeNode[]): GoodieTreeNode[] {
  return nodes.flatMap((node) => (node.children?.length ? node.children : [node]));
}

export const enum GoodieCategory {
  past = "past",
  sponsorLevel = "sponsorLevel",
  flag = "flag",
  other = "other",
}

export function getGoodieCategory(
  abstractGoodieValue: AbstractGoodieValue
): GoodieCategory {
  const conventionSetup = getConventionSetup();
  if (!(abstractGoodieValue in conventionSetup.currentGoodiesRecord)) {
    return GoodieCategory.past;
  }
  const goodies = conventionSetup.goodies;
  const isFromPackage = Object.values(goodies.forPackage).some(
    (items) => items?.includes(abstractGoodieValue)
  );
  if (isFromPackage) {
    return GoodieCategory.sponsorLevel;
  }
  const isFromFlag = Object.values(goodies.forFlag).some(
    (items) => items?.includes(abstractGoodieValue)
  );
  if (isFromFlag) {
    return GoodieCategory.flag;
  }
  return GoodieCategory.other;
}
