import { getAllAddInfos } from "@/composables/api/attsrv/additional-info/getAllGenericAddInfos";
import { type RestErrorHandler } from "@/composables/api/base/restErrorWrapper";
import { getEmptyRegDeskAddInfo } from "@/composables/services/attendee/getEmptyRegDeskAddInfo";
import type { ApiAllAddInfo } from "@/types/external/attsrv/additional-info/common";
import type { ApiRegDeskAddInfo } from "@/types/external/attsrv/additional-info/regdesk";

export async function getAllRegDeskAddInfos(
  errorHandler: RestErrorHandler
): Promise<ApiAllAddInfo<ApiRegDeskAddInfo> | undefined> {
  return await getAllAddInfos<ApiRegDeskAddInfo>(
    "Attendee Regdesk Service",
    "regdesk",
    errorHandler,
    getEmptyRegDeskAddInfo()
  );
}
