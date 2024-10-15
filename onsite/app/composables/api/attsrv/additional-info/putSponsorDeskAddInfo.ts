import { type RestErrorHandler } from "@/composables/api/base/restErrorWrapper";
import type { ApiSponsorDeskAddInfo } from "@/types/external/attsrv/additional-info/sponsordesk";
import { putAddInfo } from "@/composables/api/attsrv/additional-info/putGenericAddInfo";
import type { RegNumber } from "@/types/external/attsrv/attendees/attendee";

export async function putSponsorDeskAddInfo(
  errorHandler: RestErrorHandler,
  regNumber: RegNumber,
  itemData: ApiSponsorDeskAddInfo
): Promise<null | undefined> {
  return await putAddInfo<ApiSponsorDeskAddInfo>(
    "Attendee Items Service",
    "sponsordesk",
    errorHandler,
    regNumber,
    itemData
  );
}
