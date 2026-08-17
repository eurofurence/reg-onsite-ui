import type { ConcreteGoodieValue } from "@/config/convention";
import type { ApiSponsorDeskAddInfo } from "@/types/external/attsrv/additional-info/sponsordesk";

export function getRecordedConcreteItems(
  apiSponsorDeskAddInfo: ApiSponsorDeskAddInfo
): ConcreteGoodieValue[] {
  return [
    ...apiSponsorDeskAddInfo.pastItems,
    ...apiSponsorDeskAddInfo.issuedItems,
    ...apiSponsorDeskAddInfo.reservedItems,
  ];
}
