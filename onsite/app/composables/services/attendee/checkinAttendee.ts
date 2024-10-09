import type { RestErrorHandler } from "@/composables/api/base/restErrorWrapper";
import { putAttendeeStatus } from "@/composables/api/attsrv/attendees/putAttendeeStatus";
import { authState } from "@/composables/state/authState";
import { AttendeeApiStatus } from "@/config/metadata/metadataForStatus";

export async function checkinAttendee(
  errorHandler: RestErrorHandler,
  regNumber: number
): Promise<void> {
  const comment: string = JSON.stringify({
    by: authState.value.userName,
    where: "regdesk",
  });
  await putAttendeeStatus(
    errorHandler,
    regNumber,
    AttendeeApiStatus.checked_in,
    comment
  );
}
