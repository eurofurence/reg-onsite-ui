import { deepCopy } from "@/composables/deepCopy";
import type { ApiSponsorDeskAddInfo } from "@/types/external/attsrv/additional-info/sponsordesk";

const emptySponsorDeskAddInfo: ApiSponsorDeskAddInfo = {
  issuedItems: [],
  pastItems: [],
  reservedItems: [],
};

export function getEmptySponsorDeskAddInfo(): ApiSponsorDeskAddInfo {
  return deepCopy<ApiSponsorDeskAddInfo>(emptySponsorDeskAddInfo);
}
