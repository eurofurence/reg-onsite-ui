import type { RestErrorHandler } from "@/composables/api/base/restErrorWrapper";
import { getAttendeeByRegNumber } from "@/composables/api/attsrv/attendees/getAttendeeByRegNumber";
import { transformAttendee } from "@/composables/services/attendee/transformAttendee";
import type {
  ApiAttendeeInfo,
  RegNumber,
} from "@/types/external/attsrv/attendees/attendee";
import type { TransformedAttendeeInfo } from "@/types/internal/attendee";

export async function getAttendeeByRegNumberTrans(
  errorHandler: RestErrorHandler,
  regNumber: RegNumber
): Promise<TransformedAttendeeInfo | null | undefined> {
  const result: ApiAttendeeInfo | null | undefined =
    await getAttendeeByRegNumber(errorHandler, regNumber);
  if (result) {
    return transformAttendee(result);
  }
  return result;
}
