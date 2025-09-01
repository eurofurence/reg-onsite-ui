import { putAddInfo } from "@/composables/api/attsrv/additional-info/putGenericAddInfo";
import { type RestErrorHandler } from "@/composables/api/base/restErrorWrapper";
import type { ApiRegDeskAddInfo } from "@/types/external/attsrv/additional-info/regdesk";
import type { RegNumber } from "@/types/external/attsrv/attendees/attendee";

export async function putRegDeskDeskAddInfo(
  errorHandler: RestErrorHandler,
  regNumber: RegNumber,
  itemData: ApiRegDeskAddInfo
): Promise<null | undefined> {
  return await putAddInfo<ApiRegDeskAddInfo>(
    "Attendee Regdesk Service",
    "regdesk",
    errorHandler,
    regNumber,
    itemData
  );
}
