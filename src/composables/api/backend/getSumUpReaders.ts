import { fetchResultWrapper } from "@/composables/api/base/fetchResultWrapper";
import { getApi } from "@/composables/api/base/getApi";
import { type RestErrorHandler, restErrorWrapper } from "@/composables/api/base/restErrorWrapper";
import type { ApiError } from "@/types/external/error";
import type { FetchResultPromise } from "@/types/internal/rest";

export interface SumUpReader {
  id: string;
  name: string;
  status: string;
}

async function fetchSumUpReaders(): FetchResultPromise<{ items: SumUpReader[] }, ApiError> {
  const response = await getApi("onsite/api/v1/sumup/readers");
  return fetchResultWrapper<{ items: SumUpReader[] }>(response);
}

export async function getSumUpReaders(
  errorHandler: RestErrorHandler,
): Promise<SumUpReader[] | undefined> {
  const result = await restErrorWrapper<{ items: SumUpReader[] }>(
    "Backend Service",
    fetchSumUpReaders,
    errorHandler,
  );
  return result?.items;
}
