import { fetchResultWrapper } from "@/composables/api/base/fetchResultWrapper";
import { postApi } from "@/composables/api/base/postApi";
import {
  type RestErrorHandler,
  restErrorWrapper,
} from "@/composables/api/base/restErrorWrapper";
import type { ApiError } from "@/types/external/error";
import type { FetchResultPromise } from "@/types/internal/rest";

interface CacheMediaResponse {
  url: string;
}

async function fetchCacheMediaUrl(
  sourceUrl: string
): FetchResultPromise<CacheMediaResponse, ApiError> {
  const response = await postApi("onsite/api/v1/media/cache-url", {
    url: sourceUrl,
  });
  return fetchResultWrapper<CacheMediaResponse>(response);
}

export async function postCacheMediaUrl(
  errorHandler: RestErrorHandler,
  sourceUrl: string
): Promise<string | undefined> {
  const result = await restErrorWrapper<CacheMediaResponse>(
    "Backend Service",
    () => fetchCacheMediaUrl(sourceUrl),
    errorHandler
  );
  return result?.url;
}
