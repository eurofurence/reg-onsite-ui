import { getErrorHandlerFunction } from "@/composables/api/base/getErrorHandlerFunction";
import type { RestErrorHandler } from "@/composables/api/base/restErrorWrapper";
import {
  getErrorSearchStatus,
  getIdleNoDataSearchStatus,
  getIdleWithDataSearchStatus,
  getSearchingSearchStatus,
} from "@/composables/search_status/constructors";
import type { SearchStatus } from "@/types/internal/component/regnumsearch";
import type { OnsiteToastService } from "@/composables/services/toastService";
import type { RegNumber } from "@/types/external/attsrv/attendees/attendee";

type TrackedSearchHandler = (
  regNumber: RegNumber,
  errorHandler: RestErrorHandler
) => Promise<string[]>;

export async function doTrackedSearch(
  regNumber: RegNumber,
  searchStatus: Ref<SearchStatus>,
  toastService: OnsiteToastService,
  searchHandler: TrackedSearchHandler
): Promise<void> {
  if (regNumber === null) {
    searchStatus.value = getIdleNoDataSearchStatus();
    return;
  }
  searchStatus.value = getSearchingSearchStatus(regNumber);
  const errorList: string[] = await searchHandler(
    regNumber,
    getErrorHandlerFunction(toastService)
  );
  if (errorList.length > 0) {
    searchStatus.value = getErrorSearchStatus(regNumber, errorList);
  } else {
    searchStatus.value = getIdleWithDataSearchStatus();
  }
}
