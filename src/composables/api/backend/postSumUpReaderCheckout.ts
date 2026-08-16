import { fetchResultWrapper } from "@/composables/api/base/fetchResultWrapper";
import { postApi } from "@/composables/api/base/postApi";
import { type RestErrorHandler, restErrorWrapper } from "@/composables/api/base/restErrorWrapper";
import type { ApiError } from "@/types/external/error";
import type { FetchResultPromise } from "@/types/internal/rest";

async function fetchStartSumUpReaderCheckout(
  readerId: string,
  attendeeId: number,
): FetchResultPromise<{ job_id: string }, ApiError> {
  const response = await postApi(
    `onsite/api/v1/sumup/readers/${readerId}/checkout`,
    { attendee_id: attendeeId },
  );
  return fetchResultWrapper<{ job_id: string }>(response);
}

export async function startSumUpReaderCheckout(
  errorHandler: RestErrorHandler,
  readerId: string,
  attendeeId: number,
): Promise<{ job_id: string } | undefined> {
  return await restErrorWrapper<{ job_id: string }>(
    "Backend Service",
    () => fetchStartSumUpReaderCheckout(readerId, attendeeId),
    errorHandler,
  );
}
