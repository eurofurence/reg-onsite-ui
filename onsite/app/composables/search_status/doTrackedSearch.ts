import { getErrorHandlerFunction } from "@/composables/api/base/getErrorHandlerFunction";
import type { RestErrorHandler } from "@/composables/api/base/restErrorWrapper";
import {
  getErrorSearchStatus,
  getIdleNoDataSearchStatus,
  getIdleWithDataSearchStatus,
  getSearchingSearchStatus,
} from "@/composables/search_status/constructors";
import type { SearchStatus } from "@/types/internal";
import type { ToastServiceMethods } from "primevue/toastservice";

type TrackedSearchHandler = (
  regNumber: number,
  errorHandler: RestErrorHandler
) => Promise<string[]>;

export async function doTrackedSearch(
  regNumber: number,
  searchStatus: Ref<SearchStatus>,
  toast: ToastServiceMethods,
  toastGroup: string,
  searchHandler: TrackedSearchHandler
): Promise<void> {
  if (regNumber === null) {
    searchStatus.value = getIdleNoDataSearchStatus();
    return;
  }
  searchStatus.value = getSearchingSearchStatus(regNumber);
  const errorList: string[] = await searchHandler(
    regNumber,
    getErrorHandlerFunction(toast, toastGroup)
  );
  if (errorList.length > 0) {
    searchStatus.value = getErrorSearchStatus(regNumber, errorList);
  } else {
    searchStatus.value = getIdleWithDataSearchStatus();
  }
}
