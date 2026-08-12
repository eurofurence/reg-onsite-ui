import { fetchResultWrapper } from "@/composables/api/base/fetchResultWrapper";
import { postApi } from "@/composables/api/base/postApi";
import { type RestErrorHandler, restErrorWrapper } from "@/composables/api/base/restErrorWrapper";
import type { ApiError } from "@/types/external/error";
import type { FetchResultPromise } from "@/types/internal/rest";

async function fetchSetSumUpSetup(token: string, merchantCode: string): FetchResultPromise<{ status: string }, ApiError> {
  const response = await postApi("onsite/api/sumup/setup", { token, merchant_code: merchantCode });
  return fetchResultWrapper<{ status: string }>(response);
}

export async function setSumUpSetup(
  errorHandler: RestErrorHandler,
  token: string,
  merchantCode: string,
): Promise<boolean> {
  const result = await restErrorWrapper<{ status: string }>(
    "Backend Service",
    () => fetchSetSumUpSetup(token, merchantCode),
    errorHandler,
  );
  return result?.status === "ok";
}
