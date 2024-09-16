import type { RestErrorHandler } from "@/composables/api/base/restErrorWrapper";
import { putAttendeeStatus } from "@/composables/api/putAttendeeStatus";
import { Status } from "@/config/setupStatus";

export async function debugSetStatusToPaid(
  errorHandler: RestErrorHandler,
  regNumber: number
): Promise<void> {
  await putAttendeeStatus(errorHandler, regNumber, Status.paid, "debug");
}
