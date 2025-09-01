import { getAttendees } from "@/composables/api/attsrv/attendees/getAttendees";
import type { RestErrorHandler } from "@/composables/api/base/restErrorWrapper";
import type { ApiAttendeeInfo } from "@/types/external/attsrv/attendees/attendee";

export async function getAllAttendees(
  errorHandler: RestErrorHandler
): Promise<ApiAttendeeInfo[] | undefined> {
  return getAttendees(errorHandler, [{ nickname: "*" }]);
}
