import { getAllAddInfos } from "@/composables/api/attsrv/additional-info/getAllGenericAddInfos";
import { type RestErrorHandler } from "@/composables/api/base/restErrorWrapper";
import { getEmptySponsorDeskAddInfo } from "@/composables/services/attendee/getEmptySponsorDeskAddInfo";
import type { ApiAllAddInfo } from "@/types/external/attsrv/additional-info/common";
import type { ApiSponsorDeskAddInfo } from "@/types/external/attsrv/additional-info/sponsordesk";

export async function getAllSponsorDeskAddInfos(
  errorHandler: RestErrorHandler
): Promise<ApiAllAddInfo<ApiSponsorDeskAddInfo> | undefined> {
  return await getAllAddInfos<ApiSponsorDeskAddInfo>(
    "Attendee Items Service",
    "sponsordesk",
    errorHandler,
    getEmptySponsorDeskAddInfo()
  );
}
