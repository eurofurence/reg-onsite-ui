import { fetchResultWrapper } from "@/composables/api/base/fetchResultWrapper";
import { putApi } from "@/composables/api/base/putApi";
import { type RestErrorHandler, restErrorWrapper } from "@/composables/api/base/restErrorWrapper";
import type { ApiError } from "@/types/external/error";
import type { FetchResultPromise } from "@/types/internal/rest";

async function fetchSetSumUpSetup(token: string, merchantCode: string): FetchResultPromise<{ status: string }, ApiError> {
  const response = await putApi("onsite/api/v1/sumup/credentials", { token, merchant_code: merchantCode });
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
