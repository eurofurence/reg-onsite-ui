import { getAddInfo } from "@/composables/api/attsrv/additional-info/getGenericAddInfo";
import type { RestErrorHandler } from "@/composables/api/base/restErrorWrapper";
import type { ConcreteGoodieValue } from "@/config/convention";
import type { RegNumber } from "@/types/external/attsrv/attendees/attendee";

export interface SponsorDeskConfigRecord {
  availableItems?: ConcreteGoodieValue[];
  soldItems?: ConcreteGoodieValue[];
  sumupMapping?: Record<string, string>;
  inventoryCounts?: Record<string, number>;
}

const CONFIG_REG = 0 as RegNumber;

export async function getSponsorDeskConfig(
  errorHandler: RestErrorHandler,
): Promise<SponsorDeskConfigRecord | null | undefined> {
  return await getAddInfo<SponsorDeskConfigRecord>(
    "Attendee Items Service",
    "sponsordesk",
    errorHandler,
    CONFIG_REG,
  );
}
