import type { ConcreteGoodieValue } from "@/config/convention";
import type { ApiSponsorDeskAddInfo } from "@/types/external/attsrv/additional-info/sponsordesk";

export function getRecordedConcreteItems(
  apiSponsorDeskAddInfo: ApiSponsorDeskAddInfo
): ConcreteGoodieValue[] {
  return [
    ...new Set([
      ...apiSponsorDeskAddInfo.pastItems,
      ...apiSponsorDeskAddInfo.issuedItems,
      ...apiSponsorDeskAddInfo.reservedItems,
    ]),
  ];
}
