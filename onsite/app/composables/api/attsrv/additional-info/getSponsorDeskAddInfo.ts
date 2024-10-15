import { type RestErrorHandler } from "@/composables/api/base/restErrorWrapper";
import type { ApiSponsorDeskAddInfo } from "@/types/external/attsrv/additional-info/sponsordesk";
import { getAddInfo } from "@/composables/api/attsrv/additional-info/getGenericAddInfo";
import type { RegNumber } from "@/types/external/attsrv/attendees/attendee";

export async function getSponsorDeskAddInfo(
  errorHandler: RestErrorHandler,
  regNumber: RegNumber
): Promise<ApiSponsorDeskAddInfo | null | undefined> {
  return await getAddInfo<ApiSponsorDeskAddInfo>(
    "Attendee Items Service",
    "sponsordesk",
    errorHandler,
    regNumber
  );
}
