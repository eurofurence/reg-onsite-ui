import { deepCopy } from "@/composables/deepCopy";
import { AbstractGoodieWithoutVariants } from "@/setupEFIteration";
import type { ApiSponsorDeskAddInfo } from "@/types/external/attsrv/additional-info/sponsordesk";

const dummyData: ApiSponsorDeskAddInfo[] = [
  {
    issuedItems: [],
    pastItems: [],
    reservedItems: [],
  },
  {
    reservedItems: [],
    pastItems: [],
    issuedItems: [],
  },
  {
    reservedItems: [],
    issuedItems: [],
    pastItems: [],
  },
  {
    issuedItems: [AbstractGoodieWithoutVariants.staff_coin_2024],
    reservedItems: [],
    pastItems: [],
  },
  {
    reservedItems: [AbstractGoodieWithoutVariants.staff_coin_2024],
    issuedItems: [AbstractGoodieWithoutVariants.staff_coin_2024],
    pastItems: [],
  },
];

export function getApiSponsorDeskAddInfo(): ApiSponsorDeskAddInfo[] {
  return deepCopy<ApiSponsorDeskAddInfo[]>(dummyData);
}
