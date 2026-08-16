import { fetchResultWrapper } from "@/composables/api/base/fetchResultWrapper";
import { getApi } from "@/composables/api/base/getApi";
import { type RestErrorHandler, restErrorWrapper } from "@/composables/api/base/restErrorWrapper";
import type { ApiError } from "@/types/external/error";
import type { ApiTransaction } from "@/types/external/paysrv/transactions";
import type { FetchResultPromise } from "@/types/internal/rest";

export interface SumUpReaderCheckoutJobStatus {
  id: string;
  status: "polling" | "done" | "error";
  attendee_id: number;
  checkout_id: string;
  internal_transaction: ApiTransaction | null;
  error: string | null;
}

async function fetchSumUpReaderCheckoutJobStatus(
  jobId: string,
): FetchResultPromise<SumUpReaderCheckoutJobStatus, ApiError> {
  const response = await getApi(`onsite/api/v1/sumup/readers/checkout-job/${jobId}`);
  return fetchResultWrapper<SumUpReaderCheckoutJobStatus>(response);
}

export async function getSumUpReaderCheckoutJobStatus(
  errorHandler: RestErrorHandler,
  jobId: string,
): Promise<SumUpReaderCheckoutJobStatus | undefined> {
  return await restErrorWrapper<SumUpReaderCheckoutJobStatus>(
    "Backend Service",
    () => fetchSumUpReaderCheckoutJobStatus(jobId),
    errorHandler,
  );
}
