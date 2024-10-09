import type { RestErrorHandler } from "@/composables/api/base/restErrorWrapper";
import { putAttendeeStatus } from "@/composables/api/attsrv/attendees/putAttendeeStatus";
import { AttendeeApiStatus } from "@/config/metadata/metadataForStatus";

export async function debugSetStatusToPaid(
  errorHandler: RestErrorHandler,
  regNumber: number
): Promise<void> {
  await putAttendeeStatus(
    errorHandler,
    regNumber,
    AttendeeApiStatus.paid,
    "debug"
  );
}
