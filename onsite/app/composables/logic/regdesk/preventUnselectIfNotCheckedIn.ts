import type { TransformedAttendeeInfo } from "@/types/internal";
import { Status } from "~/config/setupStatus";
import type { ConfirmServiceMethods } from "@/types/external";

export function preventUnselectIfNotCheckedIn(
  selectedAttendeeRef: Ref<TransformedAttendeeInfo | null>,
  sourceAttendeeListRef: Ref<TransformedAttendeeInfo[]>,
  confirm: ConfirmServiceMethods,
  confirmGroup: string,
  afterDialog: CallableFunction
): void {
}
