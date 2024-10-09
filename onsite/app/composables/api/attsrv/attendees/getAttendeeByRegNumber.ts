import {
  type RestErrorHandler,
  restErrorWrapper,
} from "@/composables/api/base/restErrorWrapper";
import { fetchAttendees } from "@/composables/api/attsrv/attendees/getAttendees";
import type {
  ApiAttendeeInfo,
  ApiFindResponse,
} from "@/types/external/attsrv/attendees/attendee";
import type { ApiError } from "@/types/external/error";
import type { FetchResultPromise } from "@/types/internal/rest";

async function fetchAttendeeByRegNumber(
  regNumber: number
): FetchResultPromise<ApiFindResponse, ApiError> {
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
