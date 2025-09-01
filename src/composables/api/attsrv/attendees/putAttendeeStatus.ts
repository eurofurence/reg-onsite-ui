import { fetchResultWrapper } from "@/composables/api/base/fetchResultWrapper";
import { postApi } from "@/composables/api/base/postApi";
import {
  type RestErrorHandler,
  restErrorWrapper,
} from "@/composables/api/base/restErrorWrapper";
import type { AttendeeApiStatusValues } from "@/config/metadata/metadataForStatus";
import type { RegNumber } from "@/types/external/attsrv/attendees/attendee";
import type { ApiError } from "@/types/external/error";
import type { FetchResultPromise } from "@/types/internal/rest";

async function postAttendeeStatus(
  regNumber: RegNumber,
  status: AttendeeApiStatusValues,
  comment: string
): FetchResultPromise<null, ApiError> {
  const response: Response = await postApi(
    `attsrv/api/rest/v1/attendees/${regNumber}/status`,
    {
      status: status,
      comment: comment,
    }
  );
  if (response.ok) {
    return fetchResultWrapper(response, null);
  }
  return fetchResultWrapper(response);
}

export async function putAttendeeStatus(
  errorHandler: RestErrorHandler,
  regNumber: RegNumber,
  status: AttendeeApiStatusValues,
  comment: string
): Promise<null | undefined> {
  const response: null | undefined = await restErrorWrapper<null>(
    "Attendee Information Service",
    () => postAttendeeStatus(regNumber, status, comment),
    errorHandler
  );
  return response;
}
