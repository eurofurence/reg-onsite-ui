import type { RestErrorHandler } from "@/composables/api/base/restErrorWrapper";
import { getAttendees } from "@/composables/api/getAttendees";
import { transformAttendee } from "@/composables/services/attendee/transformAttendee";
import type {
  ApiAttendeeInfo,
  ApiSearchType,
  FlagApiValue,
  PackageApiValue,
} from "@/types/external";
import type { TransformedAttendeeInfo } from "@/types/internal";

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
