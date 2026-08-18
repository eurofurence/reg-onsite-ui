import { getAttendees } from "@/composables/api/attsrv/attendees/getAttendees";
import type { RestErrorHandler } from "@/composables/api/base/restErrorWrapper";
import type { ApiAttendeeInfo } from "@/types/external/attsrv/attendees/attendee";

export async function getAllAttendees(
  errorHandler: RestErrorHandler,
  useAdminApi?: boolean
): Promise<ApiAttendeeInfo[] | undefined> {
  return getAttendees(errorHandler, [{ nickname: "*" }], useAdminApi);
}
