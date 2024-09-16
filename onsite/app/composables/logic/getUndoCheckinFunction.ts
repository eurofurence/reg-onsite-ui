import { EnvName, type TransformedAttendeeInfo } from "@/types/internal";
import { getErrorHandlerFunction } from "../api/base/getErrorHandlerFunction";
import { attendeeService } from "../services/attendeeService";
import { environmentSettings } from "../services/environmentService";
import type { ToastServiceMethods } from "primevue/toastservice";

export function getUndoCheckinFunction(
  updateAttendee: (
    regNumber: number
  ) => Promise<TransformedAttendeeInfo | null>,
  toast: ToastServiceMethods,
  toastGroup: string
): (regNumber: number) => Promise<void> {
  return async (regNumber: number): Promise<void> => {
    if (environmentSettings.envName !== EnvName.dev) {
      return;
    }
    await attendeeService.debugSetStatusToPaid(
      getErrorHandlerFunction(toast, toastGroup),
      regNumber
    );
    await updateAttendee(regNumber);
  };
}
