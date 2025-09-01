import { putAddInfo } from "@/composables/api/attsrv/additional-info/putGenericAddInfo";
import { type RestErrorHandler } from "@/composables/api/base/restErrorWrapper";
import { authState } from "@/composables/state/authState";
import type { ApiSponsorDeskAddInfo } from "@/types/external/attsrv/additional-info/sponsordesk";
import type { RegNumber } from "@/types/external/attsrv/attendees/attendee";

export async function putSponsorDeskAddInfo(
  errorHandler: RestErrorHandler,
  regNumber: RegNumber,
  itemData: ApiSponsorDeskAddInfo
): Promise<null | undefined> {
  const jsonState = JSON.stringify(itemData, (key, value) => {
    return key === "history" ? [] : value;
  });
  itemData.history.push(
    JSON.stringify({
      state: jsonState,
      by: authState.value.userName,
      when: new Date().toISOString(),
    })
  );
  return await putAddInfo<ApiSponsorDeskAddInfo>(
    "Attendee Items Service",
    "sponsordesk",
    errorHandler,
    regNumber,
    itemData
  );
}
