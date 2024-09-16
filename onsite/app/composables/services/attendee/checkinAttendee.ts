import type { RestErrorHandler } from "@/composables/api/base/restErrorWrapper";
import { putAttendeeStatus } from "@/composables/api/putAttendeeStatus";
import { authState } from "@/composables/state/authState";
import { Status } from "@/config/setupStatus";

export async function checkinAttendee(
  errorHandler: RestErrorHandler,
  regNumber: number
): Promise<void> {
  const comment: string = JSON.stringify({
    by: authState.value.userName,
    where: "regdesk",
  });
  await putAttendeeStatus(errorHandler, regNumber, Status.checked_in, comment);
}
