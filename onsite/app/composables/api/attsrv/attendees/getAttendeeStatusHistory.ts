import { fetchResultWrapper } from "@/composables/api/base/fetchResultWrapper";
import { getApi } from "@/composables/api/base/getApi";
import {
  type RestErrorHandler,
  restErrorWrapper,
} from "@/composables/api/base/restErrorWrapper";
import type { ApiError } from "@/types/external/error";
import type { ApiAttendeeStatusHistory } from "@/types/external/attsrv/attendees/others";
import type { FetchResultPromise } from "@/types/internal/rest";
import type { RegNumber } from "@/types/external/attsrv/attendees/attendee";

async function fetchAttendeeStatusHistory(
  regNumber: RegNumber
): FetchResultPromise<ApiAttendeeStatusHistory, ApiError> {
  const response: Response = await getApi(
    `attsrv/api/rest/v1/attendees/${regNumber}/status-history`
  );
  return fetchResultWrapper<ApiAttendeeStatusHistory>(response);
}

export async function getAttendeeStatusHistory(
  errorHandler: RestErrorHandler,
  regNumber: RegNumber
): Promise<ApiAttendeeStatusHistory | undefined> {
  return await restErrorWrapper<ApiAttendeeStatusHistory>(
    "Attendee Items Service",
    () => fetchAttendeeStatusHistory(regNumber),
    errorHandler
  );
}
