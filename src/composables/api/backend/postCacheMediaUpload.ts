import { fetchResultWrapper } from "@/composables/api/base/fetchResultWrapper";
import { getUrl } from "@/composables/api/base/getUrl";
import {
  type RestErrorHandler,
  restErrorWrapper,
} from "@/composables/api/base/restErrorWrapper";
import { smartFetch } from "@/composables/api/base/smartFetch";
import type { ApiError } from "@/types/external/error";
import type { FetchResultPromise } from "@/types/internal/rest";

interface CacheMediaResponse {
  url: string;
}

async function fetchCacheMediaUpload(
  file: File
): FetchResultPromise<CacheMediaResponse, ApiError> {
  const formData = new FormData();
  formData.append("file", file);
  const response = await smartFetch(getUrl("onsite/api/v1/media/cache-upload"), {
    method: "POST",
    credentials: "include",
    body: formData,
  });
  return fetchResultWrapper<CacheMediaResponse>(response);
}

export async function postCacheMediaUpload(
  errorHandler: RestErrorHandler,
  file: File
): Promise<string | undefined> {
  const result = await restErrorWrapper<CacheMediaResponse>(
    "Backend Service",
    () => fetchCacheMediaUpload(file),
    errorHandler
  );
  return result?.url;
}
