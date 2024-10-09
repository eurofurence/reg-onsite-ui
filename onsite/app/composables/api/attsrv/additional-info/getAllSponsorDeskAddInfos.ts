import { type RestErrorHandler } from "@/composables/api/base/restErrorWrapper";
import { getEmptySponsorDeskAddInfo } from "@/composables/items/getEmptySponsorDeskAddInfo";
import type { ApiSponsorDeskAddInfo } from "@/types/external/attsrv/additional-info/sponsordesk";
import { getAllAddInfos } from "./getAllGenericAddInfos";
import type { ApiAllAddInfo } from "@/types/external/attsrv/additional-info/common";

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
