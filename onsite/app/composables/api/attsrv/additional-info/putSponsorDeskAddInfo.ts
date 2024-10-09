import { type RestErrorHandler } from "@/composables/api/base/restErrorWrapper";
import type { ApiSponsorDeskAddInfo } from "@/types/external/attsrv/additional-info/sponsordesk";
import { putAddInfo } from "@/composables/api/attsrv/additional-info/putGenericAddInfo";

export async function putSponsorDeskAddInfo(
  errorHandler: RestErrorHandler,
  regNumber: number,
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
