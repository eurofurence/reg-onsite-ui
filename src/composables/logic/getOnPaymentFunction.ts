import { authState } from "@/composables/state/authState";
import type { OnsiteToastService } from "@/composables/services/toastService";
import type { RegNumber } from "@/types/external/attsrv/attendees/attendee";
import { ToastSeverity } from "@/types/internal/primevue";
import type { Ref } from "vue";

export function getOnPaymentFunction(
  paymentRequestRef: Ref<RegNumber | null>,
  toastService: OnsiteToastService
): (regNumber: RegNumber) => void {
  return (regNumber: RegNumber): void => {
    if (authState.value.userRegNumList.includes(regNumber)) {
      toastService.add({
        severity: ToastSeverity.warn,
        summary: `You are trying to pay for yourself! Depending on the backend configuration, this might be prohibited!`,
        life: 10000,
      });
    }
    paymentRequestRef.value = regNumber;
  };
}
