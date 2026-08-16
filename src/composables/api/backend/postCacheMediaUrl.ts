import { fetchResultWrapper } from "@/composables/api/base/fetchResultWrapper";
import { getUrl } from "@/composables/api/base/getUrl";
import { postApi } from "@/composables/api/base/postApi";
import {
  type RestErrorHandler,
  restErrorWrapper,
} from "@/composables/api/base/restErrorWrapper";
import type { ApiError } from "@/types/external/error";
import type { FetchResultPromise } from "@/types/internal/rest";

interface CacheMediaResponse {
  key: string;
}

async function fetchCacheMediaUrl(
  sourceUrl: string,
  force: boolean
): FetchResultPromise<CacheMediaResponse, ApiError> {
  const response = await postApi("onsite/api/v1/media/cache-url", {
    url: sourceUrl,
    force,
  });
  return fetchResultWrapper<CacheMediaResponse>(response);
}

export async function postCacheMediaUrl(
  errorHandler: RestErrorHandler,
  sourceUrl: string,
  force = false
): Promise<string | undefined> {
  const result = await restErrorWrapper<CacheMediaResponse>(
    "Backend Service",
    () => fetchCacheMediaUrl(sourceUrl, force),
    errorHandler
  );
  if (result === undefined) {
    return undefined;
  }
  return getUrl(`onsite/api/v1/media/cache/${result.key}`).toString();
}
