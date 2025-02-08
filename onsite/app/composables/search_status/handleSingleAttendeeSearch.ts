import type { TransformedAttendeeInfo } from "@/types/internal/attendee";
import type { RestErrorHandler } from "@/composables/api/base/restErrorWrapper";
import { attendeeService } from "@/composables/services/attendeeService";
import { doTrackedSearch } from "@/composables/search_status/doTrackedSearch";
import type { RestErrorInfo } from "@/types/internal/rest";
import type { SearchStatus } from "@/types/internal/component/regnumsearch";
import type { OnsiteToastService } from "@/composables/services/toastService";
import type { RegNumber } from "@/types/external/attsrv/attendees/attendee";

async function handleSearch(
  regNumber: RegNumber,
  errorHandler: RestErrorHandler,
  resultRef: Ref<TransformedAttendeeInfo | null>
): Promise<string[]> {
  let errorList: string[] = [];
  function collectErrors(error: RestErrorInfo) {
    errorHandler(error);
    errorList.push(
      `${error.serviceName}: ${error.errorCategory} (${error.errorDetail})`
    );
  }
  const transformedAttendeeInfoPromise: Promise<
    TransformedAttendeeInfo | null | undefined
  > = attendeeService.getAttendeeByRegNumber(collectErrors, regNumber);
  const transformedAttendeeInfo: TransformedAttendeeInfo | null | undefined =
    await transformedAttendeeInfoPromise;
  if (errorList.length > 0 || transformedAttendeeInfo === undefined) {
    return errorList;
  } else {
    resultRef.value = transformedAttendeeInfo;
    if (transformedAttendeeInfo === null) {
      return [`Attendee data doesn't exist or isn't in a valid state!`];
    }
  }
  return [];
}

export async function handleSingleAttendeeSearch(
  regNumber: RegNumber,
  searchStatusRef: Ref<SearchStatus>,
  toastService: OnsiteToastService
): Promise<TransformedAttendeeInfo | null> {
  const resultRef: Ref<TransformedAttendeeInfo | null> =
    ref<TransformedAttendeeInfo | null>(null);
  await doTrackedSearch(
    regNumber,
    searchStatusRef,
    toastService,
    async (
      regNumber: RegNumber,
      errorHandler: RestErrorHandler
    ): Promise<string[]> => {
      return await handleSearch(regNumber, errorHandler, resultRef);
    }
  );
  return resultRef.value;
}
