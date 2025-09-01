import { fetchResultWrapper } from "@/composables/api/base/fetchResultWrapper";
import { postApi } from "@/composables/api/base/postApi";
import {
  type RestErrorHandler,
  restErrorWrapper,
} from "@/composables/api/base/restErrorWrapper";
import type { RegNumber } from "@/types/external/attsrv/attendees/attendee";
import type { ApiError } from "@/types/external/error";
import type { ApiTransaction } from "@/types/external/paysrv/transactions";
import type { FetchResultPromise } from "@/types/internal/rest";

async function postCashPaymentForAttendee(
  regNumber: RegNumber
): FetchResultPromise<ApiTransaction, ApiError> {
  const response: Response = await postApi(
    `paysrv/api/rest/v1/transactions/initiate-payment`,
    {
      debitor_id: regNumber,
      method: "transfer",
    }
  );
  return fetchResultWrapper<ApiTransaction>(response);
}

export async function putCashPaymentForAttendee(
  errorHandler: RestErrorHandler,
  regNumber: RegNumber
): Promise<ApiTransaction | undefined> {
  const response: ApiTransaction | null | undefined =
    await restErrorWrapper<ApiTransaction>(
      "Attendee Payment Service",
      () => postCashPaymentForAttendee(regNumber),
      errorHandler
    );
  return response;
}
