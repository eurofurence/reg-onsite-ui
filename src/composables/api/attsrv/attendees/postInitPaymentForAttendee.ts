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

export type PaymentMethod = "cash" | "credit" | "transfer" | "internal" | "gift";

async function postInitPayment(
  regNumber: RegNumber,
  method: PaymentMethod
): FetchResultPromise<ApiTransaction, ApiError> {
  const response: Response = await postApi(
    `onsite/api/v1/attendees/${regNumber}/payment`,
    { method }
  );
  return fetchResultWrapper<ApiTransaction>(response);
}

export async function postInitPaymentForAttendee(
  errorHandler: RestErrorHandler,
  regNumber: RegNumber,
  method: PaymentMethod
): Promise<ApiTransaction | undefined> {
  const response: ApiTransaction | null | undefined =
    await restErrorWrapper<ApiTransaction>(
      "Attendee Payment Service",
      () => postInitPayment(regNumber, method),
      errorHandler
    );
  return response;
}
