import type { RestErrorHandler } from "@/composables/api/base/restErrorWrapper";
import { getAttendees } from "@/composables/api/getAttendees";
import type { ApiAttendeeInfo } from "@/types/external";

export async function getAllAttendees(
  errorHandler: RestErrorHandler
): Promise<ApiAttendeeInfo[] | undefined> {
  return getAttendees(errorHandler, [{ nickname: "*" }]);
}
