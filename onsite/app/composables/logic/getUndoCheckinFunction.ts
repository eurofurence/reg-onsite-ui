import type { TransformedAttendeeInfo } from "@/types/internal/attendee";
import { getErrorHandlerFunction } from "@/composables/api/base/getErrorHandlerFunction";
import { attendeeService } from "@/composables/services/attendeeService";
import { environmentSettings } from "@/composables/services/environmentService";
import { EnvName } from "@/types/internal/env";
import type { OnsiteToastService } from "@/composables/services/toastService";

export function getUndoCheckinFunction(
  updateAttendee: (
    regNumber: number
  ) => Promise<TransformedAttendeeInfo | null>,
  toastService: OnsiteToastService
): (regNumber: number) => Promise<void> {
  return async (regNumber: number): Promise<void> => {
    if (environmentSettings.envName !== EnvName.dev) {
      return;
    }
    await attendeeService.debugSetStatusToPaid(
      getErrorHandlerFunction(toastService),
      regNumber
    );
    await updateAttendee(regNumber);
  };
}
