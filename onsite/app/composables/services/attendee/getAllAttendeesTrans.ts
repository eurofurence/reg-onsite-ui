import type { RestErrorHandler } from "@/composables/api/base/restErrorWrapper";
import { getAllAttendees } from "@/composables/api/getAllAttendees";
import { transformAttendee } from "@/composables/services/attendee/transformAttendee";
import type { ApiAttendeeInfo } from "@/types/external";
import type { TransformedAttendeeInfo } from "@/types/internal";

export async function getAllAttendeesTrans(
  errorHandler: RestErrorHandler
): Promise<TransformedAttendeeInfo[] | undefined> {
  const result: ApiAttendeeInfo[] | undefined = await getAllAttendees(
    errorHandler
  );
  if (result) {
    return result.map(transformAttendee);
  }
  return result;
}
