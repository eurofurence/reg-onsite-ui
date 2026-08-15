import { fetchResultWrapper } from "@/composables/api/base/fetchResultWrapper";
import { getApi } from "@/composables/api/base/getApi";
import { postApi } from "@/composables/api/base/postApi";
import { type RestErrorHandler, restErrorWrapper } from "@/composables/api/base/restErrorWrapper";
import type { ApiError } from "@/types/external/error";
import type { FetchResultPromise } from "@/types/internal/rest";

export interface SumUpProductCountsJobStatus {
  id: string;
  status: "running" | "done" | "error";
  pages_fetched: number;
  transactions_found: number;
  details_fetched: number;
  counts: Record<string, number> | null;
  error: string | null;
}

async function fetchStartSumUpProductCounts(): FetchResultPromise<{ job_id: string }, ApiError> {
  const response = await postApi("onsite/api/v1/sumup/product-count-job", {});
  return fetchResultWrapper<{ job_id: string }>(response);
}

export async function startSumUpProductCountsFetch(
  errorHandler: RestErrorHandler,
): Promise<{ job_id: string } | undefined> {
  return await restErrorWrapper<{ job_id: string }>(
    "Backend Service",
    fetchStartSumUpProductCounts,
    errorHandler,
  );
}

async function fetchSumUpProductCountsStatus(): FetchResultPromise<SumUpProductCountsJobStatus, ApiError> {
  const response = await getApi("onsite/api/v1/sumup/product-count-job");
  return fetchResultWrapper<SumUpProductCountsJobStatus>(response);
}

export async function getSumUpProductCountsStatus(
  errorHandler: RestErrorHandler,
): Promise<SumUpProductCountsJobStatus | undefined> {
  return await restErrorWrapper<SumUpProductCountsJobStatus>(
    "Backend Service",
    fetchSumUpProductCountsStatus,
    errorHandler,
  );
}
