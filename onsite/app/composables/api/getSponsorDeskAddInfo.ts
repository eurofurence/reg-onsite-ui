import { fetchResultWrapper } from "@/composables/api/base/fetchResultWrapper";
import { getApi } from "@/composables/api/base/getApi";
import {
  type RestErrorHandler,
  restErrorWrapper,
} from "@/composables/api/base/restErrorWrapper";
import type { ApiSponsorDeskAddInfo } from "@/types/external";
import type { FetchResultPromise } from "@/types/internal";

export async function fetchSponsorDeskAddInfo(
  regNumber: number
): FetchResultPromise<ApiSponsorDeskAddInfo | null> {
  const response: Response = await getApi(
    `attsrv/api/rest/v1/attendees/${regNumber}/additional-info/sponsordesk`
  );
  const data = await response.json();
  if (data?.message === "addinfo.notfound.error") {
    return {
      ok: true,
      status: response.status,
      data: null,
    };
  }
  return fetchResultWrapper<ApiSponsorDeskAddInfo>(response, data);
}

export async function getSponsorDeskAddInfo(
  errorHandler: RestErrorHandler,
  regNumber: number
): Promise<ApiSponsorDeskAddInfo | null | undefined> {
  return await restErrorWrapper<ApiSponsorDeskAddInfo | null>(
    "Attendee Items Service",
    () => fetchSponsorDeskAddInfo(regNumber),
    errorHandler
  );
}
