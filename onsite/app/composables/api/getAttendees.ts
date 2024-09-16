import { fetchResultWrapper } from "@/composables/api/base/fetchResultWrapper";
import { postApi } from "@/composables/api/base/postApi";
import {
  type RestErrorHandler,
  restErrorWrapper,
} from "@/composables/api/base/restErrorWrapper";
import type {
  ApiAttendeeInfo,
  ApiFindResponse,
  ApiSearchType,
  FlagApiValue,
  PackageApiValue,
} from "@/types/external";
import type { FetchResultPromise } from "@/types/internal";

export async function fetchAttendees(
  match_any_params: ApiSearchType<PackageApiValue, FlagApiValue>[]
): FetchResultPromise<ApiFindResponse> {
  const response: Response = await postApi(
    `attsrv/api/rest/v1/attendees/find`,
    {
      match_any: match_any_params,
    }
  );
  return fetchResultWrapper<ApiFindResponse>(response);
}

export async function getAttendees(
  errorHandler: RestErrorHandler,
  match_any_params: ApiSearchType<PackageApiValue, FlagApiValue>[]
): Promise<ApiAttendeeInfo[] | undefined> {
  const response: ApiFindResponse | undefined =
    await restErrorWrapper<ApiFindResponse>(
      "Attendee Information Service",
      () => fetchAttendees(match_any_params),
      errorHandler
    );
  return response?.attendees;
}
