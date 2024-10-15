import { deepCopy } from "@/composables/deepCopy";
import type { ApiSponsorDeskAddInfo } from "@/types/external/attsrv/additional-info/sponsordesk";
import { AbstractEFGoodieWithoutVariants2024 } from "@/config/convention/eurofurence/ef2024";

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
    issuedItems: [AbstractEFGoodieWithoutVariants2024.staff_coin_2024],
    reservedItems: [],
    pastItems: [],
  },
  {
    reservedItems: [AbstractEFGoodieWithoutVariants2024.staff_coin_2024],
    issuedItems: [AbstractEFGoodieWithoutVariants2024.staff_coin_2024],
    pastItems: [],
  },
];

export function getApiSponsorDeskAddInfo(): ApiSponsorDeskAddInfo[] {
  return deepCopy<ApiSponsorDeskAddInfo[]>(dummyData);
}
