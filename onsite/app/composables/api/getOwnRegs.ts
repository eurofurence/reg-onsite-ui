import { fetchResultWrapper } from "@/composables/api/base/fetchResultWrapper";
import { getApi } from "@/composables/api/base/getApi";
import {
  type RestErrorHandler,
  restErrorWrapper,
} from "@/composables/api/base/restErrorWrapper";
import type { ApiRegListResponse } from "@/types/external";
import type { FetchResultPromise } from "@/types/internal";

export async function fetchOwnRegs(): FetchResultPromise<ApiRegListResponse> {
  const response: Response = await getApi(`attsrv/api/rest/v1/attendees`);
  return fetchResultWrapper<ApiRegListResponse>(response);
}

export async function getOwnRegs(
  errorHandler: RestErrorHandler
): Promise<number[] | undefined> {
  const response: ApiRegListResponse | undefined =
    await restErrorWrapper<ApiRegListResponse>(
      "Attendee Information Service",
      fetchOwnRegs,
      errorHandler
    );
  return response?.ids;
}
