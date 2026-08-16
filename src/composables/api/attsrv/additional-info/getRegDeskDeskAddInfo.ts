import { getAddInfo } from "@/composables/api/attsrv/additional-info/getGenericAddInfo";
import { type RestErrorHandler } from "@/composables/api/base/restErrorWrapper";
import { getEmptyRegDeskAddInfo } from "@/composables/services/attendee/getEmptyRegDeskAddInfo";
import type { ApiRegDeskAddInfo } from "@/types/external/attsrv/additional-info/regdesk";
import type { RegNumber } from "@/types/external/attsrv/attendees/attendee";

export async function getRegDeskDeskAddInfo(
  errorHandler: RestErrorHandler,
  regNumber: RegNumber
): Promise<ApiRegDeskAddInfo | null | undefined> {
  const addInfo = await getAddInfo<ApiRegDeskAddInfo>(
    "Attendee Regdesk Service",
    "regdesk",
    errorHandler,
    regNumber
  );
  if (!addInfo) {
    return addInfo;
  }
  return { ...getEmptyRegDeskAddInfo(), ...addInfo };
}
