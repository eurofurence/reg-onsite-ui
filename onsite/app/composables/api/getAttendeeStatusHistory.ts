import { fetchResultWrapper } from "@/composables/api/base/fetchResultWrapper";
import { getApi } from "@/composables/api/base/getApi";
import {
  type RestErrorHandler,
  restErrorWrapper,
} from "@/composables/api/base/restErrorWrapper";
import type { ApiAttendeeStatusHistory } from "@/types/external";
import type { FetchResultPromise } from "@/types/internal";

export async function fetchAttendeeStatusHistory(
  regNumber: number
): FetchResultPromise<ApiAttendeeStatusHistory> {
  const response: Response = await getApi(
    `attsrv/api/rest/v1/attendees/${regNumber}/status-history`
  );
  return fetchResultWrapper<ApiAttendeeStatusHistory>(response);
}

export async function getAttendeeStatusHistory(
  errorHandler: RestErrorHandler,
  regNumber: number
): Promise<ApiAttendeeStatusHistory | undefined> {
  return await restErrorWrapper<ApiAttendeeStatusHistory>(
    "Attendee Items Service",
    () => fetchAttendeeStatusHistory(regNumber),
    errorHandler
  );
}
