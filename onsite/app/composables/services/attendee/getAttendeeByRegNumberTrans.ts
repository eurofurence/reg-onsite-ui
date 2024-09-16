import type { RestErrorHandler } from "@/composables/api/base/restErrorWrapper";
import { getAttendeeByRegNumber } from "@/composables/api/getAttendeeByRegNumber";
import { transformAttendee } from "@/composables/services/attendee/transformAttendee";
import type { ApiAttendeeInfo } from "@/types/external";
import type { TransformedAttendeeInfo } from "@/types/internal";

export async function getAttendeeByRegNumberTrans(
  errorHandler: RestErrorHandler,
  regNumber: number
): Promise<TransformedAttendeeInfo | null | undefined> {
  const result: ApiAttendeeInfo | null | undefined =
    await getAttendeeByRegNumber(errorHandler, regNumber);
  if (result) {
    return transformAttendee(result);
  }
  return result;
}
