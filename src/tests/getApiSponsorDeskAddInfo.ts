import { deepCopy } from "@/composables/deepCopy";
import { AbstractEFGoodieWithoutVariants2024 } from "@/config/convention/eurofurence/ef2024";
import type { ApiSponsorDeskAddInfo } from "@/types/external/attsrv/additional-info/sponsordesk";

const dummyData: ApiSponsorDeskAddInfo[] = [
  {
    issuedItems: [],
    pastItems: [],
    reservedItems: [],
    comment: "Test Comment",
    history: [],
  },
  {
    reservedItems: [],
    pastItems: [],
    issuedItems: [],
    comment: "",
    history: [],
  },
  {
    reservedItems: [],
    issuedItems: [],
    pastItems: [],
    comment: "Test comment",
    history: [],
  },
  {
    issuedItems: [AbstractEFGoodieWithoutVariants2024.staff_coin_2024],
    reservedItems: [],
    pastItems: [],
    comment: "",
    history: [],
  },
  {
    reservedItems: [AbstractEFGoodieWithoutVariants2024.staff_coin_2024],
    issuedItems: [AbstractEFGoodieWithoutVariants2024.staff_coin_2024],
    pastItems: [],
    comment: "",
    history: [],
  },
];

export function getApiSponsorDeskAddInfo(): ApiSponsorDeskAddInfo[] {
  return deepCopy<ApiSponsorDeskAddInfo[]>(dummyData);
}
