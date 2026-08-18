import { fetchResultWrapper } from "@/composables/api/base/fetchResultWrapper";
import { postApi } from "@/composables/api/base/postApi";
import {
  type RestErrorHandler,
  restErrorWrapper,
} from "@/composables/api/base/restErrorWrapper";
import { isInAnyGroup } from "@/composables/state/authState";
import type {
  ApiAttendeeInfo,
  ApiFindResponse,
  ApiSearchType,
  FlagApiValue,
  PackageApiValue,
} from "@/types/external/attsrv/attendees/attendee";
import type { ApiError } from "@/types/external/error";
import { AuthGroups } from "@/types/internal/convention";
import type { FetchResultPromise } from "@/types/internal/rest";

export async function fetchAttendees(
  match_any_params: ApiSearchType<PackageApiValue, FlagApiValue>[],
  useAdminApi?: boolean
): FetchResultPromise<ApiFindResponse, ApiError> {
  const api: string = useAdminApi && isInAnyGroup(AuthGroups.admin)
    ? `onsite/api/v1/attendees/search`
    : `attsrv/api/rest/v1/attendees/find`;
  const response: Response = await postApi(api, {
    match_any: match_any_params,
  });
  return fetchResultWrapper<ApiFindResponse>(response);
}

export async function getAttendees(
  errorHandler: RestErrorHandler,
  match_any_params: ApiSearchType<PackageApiValue, FlagApiValue>[],
  useAdminApi?: boolean
): Promise<ApiAttendeeInfo[] | undefined> {
  const response: ApiFindResponse | undefined =
    await restErrorWrapper<ApiFindResponse>(
      "Attendee Information Service",
      () => fetchAttendees(match_any_params, useAdminApi),
      errorHandler
    );
  return response?.attendees;
}
