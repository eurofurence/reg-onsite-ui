import { getAttendees } from "@/composables/api/attsrv/attendees/getAttendees";
import type { RestErrorHandler } from "@/composables/api/base/restErrorWrapper";
import { transformAttendee } from "@/composables/services/attendee/transformAttendee";
import type {
  ApiAttendeeInfo,
  ApiSearchType,
  FlagApiValue,
  PackageApiValue,
} from "@/types/external/attsrv/attendees/attendee";
import type { TransformedAttendeeInfo } from "@/types/internal/attendee";

export async function getAttendeesTrans(
  errorHandler: RestErrorHandler,
  match_any_params: ApiSearchType<PackageApiValue, FlagApiValue>[]
): Promise<TransformedAttendeeInfo[] | undefined> {
  const result: ApiAttendeeInfo[] | undefined = await getAttendees(
    errorHandler,
    match_any_params
  );
  if (result) {
    return result.map(transformAttendee);
  }
  return result;
}
