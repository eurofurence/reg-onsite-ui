import type { RestErrorHandler } from "@/composables/api/base/restErrorWrapper";
import { putAttendeeStatus } from "@/composables/api/attsrv/attendees/putAttendeeStatus";
import { AttendeeApiStatus } from "@/config/metadata/metadataForStatus";
import type { RegNumber } from "@/types/external/attsrv/attendees/attendee";

export async function debugSetStatusToPaid(
  errorHandler: RestErrorHandler,
  regNumber: RegNumber
): Promise<void> {
  await putAttendeeStatus(
    errorHandler,
    regNumber,
    AttendeeApiStatus.paid,
    "debug"
  );
}
