import { deepCopy } from "@/composables/deepCopy";
import { AbstractTCGoodieWithoutVariants2024 } from "@/config/convention/testcon/testcon2024";
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
    issuedItems: [AbstractTCGoodieWithoutVariants2024.staff_coin_2024],
    reservedItems: [],
    pastItems: [],
    comment: "",
    history: [],
  },
  {
    reservedItems: [AbstractTCGoodieWithoutVariants2024.staff_coin_2024],
    issuedItems: [AbstractTCGoodieWithoutVariants2024.staff_coin_2024],
    pastItems: [],
    comment: "",
    history: [],
  },
];

export function getApiSponsorDeskAddInfo(): ApiSponsorDeskAddInfo[] {
  return deepCopy<ApiSponsorDeskAddInfo[]>(dummyData);
}
