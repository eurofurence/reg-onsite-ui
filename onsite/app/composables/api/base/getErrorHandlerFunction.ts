import type { RestErrorInfo } from "@/types/internal";
import type { ToastServiceMethods } from "primevue/toastservice";

function internalErrorHandler(
  toast: ToastServiceMethods,
  toastGroup: string,
  errorInfo: RestErrorInfo
) {
  const summary: string = `${errorInfo.serviceName}: ${errorInfo.errorCategory}`;
  if (toast !== null) {
    toast.add({
      group: toastGroup,
      severity: "error",
      summary: summary,
      detail: errorInfo.errorDetail,
      life: 10000,
    });
  } else {
    console.error(`${summary}: ${JSON.stringify(errorInfo.errorDetail)}`);
  }
}

export function getErrorHandlerFunction(
  toast: ToastServiceMethods,
  toastGroup: string
) {
  return (errorInfo: RestErrorInfo) =>
    internalErrorHandler(toast, toastGroup, errorInfo);
}
