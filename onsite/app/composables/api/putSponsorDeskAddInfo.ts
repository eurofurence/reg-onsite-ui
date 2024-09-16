import { fetchResultWrapper } from "@/composables/api/base/fetchResultWrapper";
import { postApi } from "@/composables/api/base/postApi";
import {
  type RestErrorHandler,
  restErrorWrapper,
} from "@/composables/api/base/restErrorWrapper";
import type { ApiSponsorDeskAddInfo } from "@/types/external";
import type { FetchResultPromise } from "@/types/internal";

export async function postSponsorDeskAddInfo(
  regNumber: number,
  itemData: ApiSponsorDeskAddInfo
): FetchResultPromise<any> {
  const response: Response = await postApi(
    `attsrv/api/rest/v1/attendees/${regNumber}/additional-info/sponsordesk`,
    itemData
  );
  const data = await response.body?.getReader()?.read();
  return fetchResultWrapper<any>(response, data);
}

export async function putSponsorDeskAddInfo(
  errorHandler: RestErrorHandler,
  regNumber: number,
  itemData: ApiSponsorDeskAddInfo
): Promise<null | undefined> {
  const result: any | undefined = await restErrorWrapper<null>(
    "Attendee Items Service",
    () => postSponsorDeskAddInfo(regNumber, itemData),
    errorHandler
  );
  if (result !== undefined) {
    return null;
  } else {
    return undefined;
  }
}
