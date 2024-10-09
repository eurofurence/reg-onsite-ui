import { type RestErrorHandler } from "@/composables/api/base/restErrorWrapper";
import type { ApiSponsorDeskAddInfo } from "@/types/external/attsrv/additional-info/sponsordesk";
import { getAddInfo } from "@/composables/api/attsrv/additional-info/getGenericAddInfo";

export async function getSponsorDeskAddInfo(
  errorHandler: RestErrorHandler,
  regNumber: number
): Promise<ApiSponsorDeskAddInfo | null | undefined> {
  return await getAddInfo<ApiSponsorDeskAddInfo>(
    "Attendee Items Service",
    "sponsordesk",
    errorHandler,
    regNumber
  );
}
