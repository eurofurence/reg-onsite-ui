import type { OnsiteToastService } from "@/composables/services/toastService";
import { ToastSeverity } from "@/types/internal/primevue";
import type { RestErrorInfo } from "@/types/internal/rest";

function internalErrorHandler(
  toastService: OnsiteToastService | null,
  errorInfo: RestErrorInfo
) {
  const summary: string = `${errorInfo.serviceName}: ${errorInfo.errorCategory}`;
  if (toastService !== null) {
    toastService.add({
      severity: ToastSeverity.error,
      summary: summary,
      detail: errorInfo.errorDetail,
      life: 10000,
    });
  } else {
    console.error(`${summary}: ${JSON.stringify(errorInfo.errorDetail)}`);
  }
}

export function getErrorHandlerFunction(toastService: OnsiteToastService) {
  return (errorInfo: RestErrorInfo) =>
    internalErrorHandler(toastService, errorInfo);
}
