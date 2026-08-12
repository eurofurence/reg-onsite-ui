import { fetchResultWrapper } from "@/composables/api/base/fetchResultWrapper";
import { getApi } from "@/composables/api/base/getApi";
import { restErrorWrapper, type RestErrorHandler } from "@/composables/api/base/restErrorWrapper";
import type { ApiError } from "@/types/external/error";
import type { FetchResultPromise } from "@/types/internal/rest";
import type { RegNumber } from "@/types/external/attsrv/attendees/attendee";

interface PaymentDatesResponse {
  entries: Array<{ reg_number: number; paid_at: string | null }>;
}

async function fetchGoodieLevelPaymentDates(
  level: string
): FetchResultPromise<PaymentDatesResponse, ApiError> {
  const response: Response = await getApi(
    `onsite/api/goodie-payment-dates/${encodeURIComponent(level)}`
  );
  return fetchResultWrapper<PaymentDatesResponse>(response);
}

export async function getGoodieLevelPaymentDates(
  errorHandler: RestErrorHandler,
  level: string
): Promise<Map<RegNumber, string | null> | undefined> {
  const result = await restErrorWrapper<PaymentDatesResponse>(
    "Backend Service",
    () => fetchGoodieLevelPaymentDates(level),
    errorHandler
  );
  if (!result) return undefined;
  return new Map(
    result.entries.map((e) => [e.reg_number as RegNumber, e.paid_at])
  );
}
