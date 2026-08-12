import { fetchResultWrapper } from "@/composables/api/base/fetchResultWrapper";
import { getApi } from "@/composables/api/base/getApi";
import { type RestErrorHandler, restErrorWrapper } from "@/composables/api/base/restErrorWrapper";
import type { ApiError } from "@/types/external/error";
import type { FetchResultPromise } from "@/types/internal/rest";

async function fetchSumUpProductCounts(): FetchResultPromise<Record<string, number>, ApiError> {
  const response = await getApi("onsite/api/sumup/product-counts");
  return fetchResultWrapper<Record<string, number>>(response);
}

export async function getSumUpProductCounts(
  errorHandler: RestErrorHandler,
): Promise<Record<string, number> | undefined> {
  return await restErrorWrapper<Record<string, number>>(
    "Backend Service",
    fetchSumUpProductCounts,
    errorHandler,
  );
}
