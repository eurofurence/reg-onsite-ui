import { fetchResultWrapper } from "@/composables/api/base/fetchResultWrapper";
import { getApi } from "@/composables/api/base/getApi";
import {
  type RestErrorHandler,
  restErrorWrapper,
} from "@/composables/api/base/restErrorWrapper";
import type { ApiError } from "@/types/external/error";
import type { ApiRegListResponse } from "@/types/external/attsrv/attendees/others";
import type { FetchResultPromise } from "@/types/internal/rest";

async function fetchOwnRegs(): FetchResultPromise<
  ApiRegListResponse,
  ApiError
> {
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
