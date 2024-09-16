import type {
  RestErrorInfo,
  SearchStatus,
  TransformedAttendeeInfo,
} from "@/types/internal";
import type { RestErrorHandler } from "../api/base/restErrorWrapper";
import { attendeeService } from "../services/attendeeService";
import { doTrackedSearch } from "@/composables/search_status/doTrackedSearch";
import type { ToastServiceMethods } from "primevue/toastservice";

async function handleSearch(
  regNumber: number,
  errorHandler: RestErrorHandler,
  resultRef: Ref<TransformedAttendeeInfo | null>
): Promise<string[]> {
  var errorList: string[] = [];
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
  regNumber: number,
  searchStatusRef: Ref<SearchStatus>,
  toast: ToastServiceMethods,
  toastGroup: string
): Promise<TransformedAttendeeInfo | null> {
  const resultRef: Ref<TransformedAttendeeInfo | null> =
    ref<TransformedAttendeeInfo | null>(null);
  await doTrackedSearch(
    regNumber,
    searchStatusRef,
    toast,
    toastGroup,
    async (
      regNumber: number,
      errorHandler: RestErrorHandler
    ): Promise<string[]> => {
      return await handleSearch(regNumber, errorHandler, resultRef);
    }
  );
  return resultRef.value;
}
