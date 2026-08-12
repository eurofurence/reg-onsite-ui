import { putAddInfo } from "@/composables/api/attsrv/additional-info/putGenericAddInfo";
import type { RestErrorHandler } from "@/composables/api/base/restErrorWrapper";
import type { SponsorDeskConfigRecord } from "@/composables/api/attsrv/additional-info/getSponsorDeskConfig";
import type { RegNumber } from "@/types/external/attsrv/attendees/attendee";

const CONFIG_REG = 0 as RegNumber;

export async function putSponsorDeskConfig(
  errorHandler: RestErrorHandler,
  config: SponsorDeskConfigRecord,
): Promise<null | undefined> {
  return await putAddInfo<SponsorDeskConfigRecord>(
    "Attendee Items Service",
    "sponsordesk",
    errorHandler,
    CONFIG_REG,
    config,
  );
}
