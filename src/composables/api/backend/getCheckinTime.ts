import { fetchResultWrapper } from "@/composables/api/base/fetchResultWrapper";
import { getApi } from "@/composables/api/base/getApi";
import {
  type RestErrorHandler,
  restErrorWrapper,
} from "@/composables/api/base/restErrorWrapper";
import type { RegNumber } from "@/types/external/attsrv/attendees/attendee";
import type { ApiError } from "@/types/external/error";
import type { FetchResultPromise } from "@/types/internal/rest";

type ApiCheckinTimeResponse = {
  checked_in_at: string | null;
};

async function fetchCheckinTime(
  regNumber: RegNumber
): FetchResultPromise<ApiCheckinTimeResponse, ApiError> {
  const response: Response = await getApi(
    `onsite/api/v1/attendees/${regNumber}/check-in`
  );
  return fetchResultWrapper<ApiCheckinTimeResponse>(response);
}

export async function getCheckinTime(
  errorHandler: RestErrorHandler,
  regNumber: RegNumber
): Promise<string | null> {
  const result: ApiCheckinTimeResponse | undefined =
    await restErrorWrapper<ApiCheckinTimeResponse>(
      "Backend Service",
      () => fetchCheckinTime(regNumber),
      errorHandler
    );
  return result?.checked_in_at ?? null;
}
