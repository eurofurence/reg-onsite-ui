import { getAddInfo } from "@/composables/api/attsrv/additional-info/getGenericAddInfo";
import { type RestErrorHandler } from "@/composables/api/base/restErrorWrapper";
import type { ApiRegDeskAddInfo } from "@/types/external/attsrv/additional-info/regdesk";
import type { RegNumber } from "@/types/external/attsrv/attendees/attendee";

export async function getRegDeskDeskAddInfo(
  errorHandler: RestErrorHandler,
  regNumber: RegNumber
): Promise<ApiRegDeskAddInfo | null | undefined> {
  return await getAddInfo<ApiRegDeskAddInfo>(
    "Attendee Regdesk Service",
    "regdesk",
    errorHandler,
    regNumber
  );
}
