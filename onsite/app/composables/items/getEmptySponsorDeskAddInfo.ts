import { deepCopy } from "@/composables/state/deepCopy";
import type { ApiSponsorDeskAddInfo } from "@/types/external";

const emptySponsorDeskAddInfo: ApiSponsorDeskAddInfo = {
  issuedItems: [],
  pastItems: [],
  reservedItems: [],
};

export function getEmptySponsorDeskAddInfo(): ApiSponsorDeskAddInfo {
  return deepCopy<ApiSponsorDeskAddInfo>(emptySponsorDeskAddInfo);
}
