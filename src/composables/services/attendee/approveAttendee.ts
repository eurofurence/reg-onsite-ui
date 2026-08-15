import { putAttendeeStatus } from "@/composables/api/attsrv/attendees/putAttendeeStatus";
import type { RestErrorHandler } from "@/composables/api/base/restErrorWrapper";
import { authState } from "@/composables/state/authState";
import { AttendeeApiStatus } from "@/config/metadata/metadataForStatus";
import type { RegNumber } from "@/types/external/attsrv/attendees/attendee";

export async function approveAttendee(
  errorHandler: RestErrorHandler,
  regNumber: RegNumber
): Promise<void> {
  const comment: string = JSON.stringify({
    by: authState.value.userName,
    where: "cashierdesk",
  });
  await putAttendeeStatus(
    errorHandler,
    regNumber,
    AttendeeApiStatus.approved,
    comment
  );
}
