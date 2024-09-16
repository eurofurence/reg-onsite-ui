import { deepCopy } from "@/composables/state/deepCopy";
import { AbstractTrinketWithoutVariants } from "@/setupEFIteration";
import type { ApiSponsorDeskAddInfo } from "@/types/external";

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
    issuedItems: [AbstractTrinketWithoutVariants.coin_2024],
    reservedItems: [],
    pastItems: [],
  },
  {
    reservedItems: [AbstractTrinketWithoutVariants.coin_2024],
    issuedItems: [AbstractTrinketWithoutVariants.coin_2024],
    pastItems: [],
  },
];

export function getApiSponsorDeskAddInfo(): ApiSponsorDeskAddInfo[] {
  return deepCopy<ApiSponsorDeskAddInfo[]>(dummyData);
}
