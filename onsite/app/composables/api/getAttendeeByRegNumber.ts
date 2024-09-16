import {
  type RestErrorHandler,
  restErrorWrapper,
} from "@/composables/api/base/restErrorWrapper";
import { fetchAttendees } from "@/composables/api/getAttendees";
import type { ApiAttendeeInfo, ApiFindResponse } from "@/types/external";
import type { FetchResultPromise } from "@/types/internal";

async function fetchAttendeeByRegNumber(
  regNumber: number
): FetchResultPromise<ApiFindResponse> {
  return await fetchAttendees([
    {
      ids: [regNumber],
    },
  ]);
}

export async function getAttendeeByRegNumber(
  errorHandler: RestErrorHandler,
  regNumber: number
): Promise<ApiAttendeeInfo | null | undefined> {
  const response: ApiFindResponse | undefined =
    await restErrorWrapper<ApiFindResponse>(
      "Attendee Information Service",
      () => fetchAttendeeByRegNumber(regNumber),
      errorHandler
    );
  if (response?.attendees === undefined) {
    return undefined;
  }
  if (response?.attendees[0] === undefined) {
    return null;
  }
  return response.attendees[0];
}
