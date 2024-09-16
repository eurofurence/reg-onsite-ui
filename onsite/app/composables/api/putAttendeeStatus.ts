import { fetchResultWrapper } from "@/composables/api/base/fetchResultWrapper";
import { postApi } from "@/composables/api/base/postApi";
import {
  type RestErrorHandler,
  restErrorWrapper,
} from "@/composables/api/base/restErrorWrapper";
import type { StatusValues } from "@/config/setupStatus";
import type { FetchResultPromise } from "@/types/internal";

async function postAttendeeStatus(
  regNumber: number,
  status: StatusValues,
  comment: string
): FetchResultPromise<null> {
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
  regNumber: number,
  status: StatusValues,
  comment: string
): Promise<null | undefined> {
  const response: null | undefined = await restErrorWrapper<null>(
    "Attendee Information Service",
    () => postAttendeeStatus(regNumber, status, comment),
    errorHandler
  );
  return response;
}
