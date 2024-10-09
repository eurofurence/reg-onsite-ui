import { fetchResultWrapper } from "@/composables/api/base/fetchResultWrapper";
import { getApi } from "@/composables/api/base/getApi";
import {
  type RestErrorHandler,
  restErrorWrapper,
} from "@/composables/api/base/restErrorWrapper";
import { authState } from "@/composables/state/authState";
import type { ApiError } from "@/types/external/error";
import type { ApiFrontendUserInfo } from "@/types/external/authsrv/frontenduserinfo";
import type { FetchResultPromise } from "@/types/internal/rest";

async function fetchFrontendUserInfo(): FetchResultPromise<
  ApiFrontendUserInfo,
  ApiError
> {
  const response: Response = await getApi("authsrv/v1/frontend-userinfo");
  return fetchResultWrapper<ApiFrontendUserInfo>(response);
}

export async function getFrontendUserInfo(
  errorHandler: RestErrorHandler
): Promise<ApiFrontendUserInfo | undefined> {
  const result: ApiFrontendUserInfo | undefined =
    await restErrorWrapper<ApiFrontendUserInfo>(
      "Frontend Service",
      fetchFrontendUserInfo,
      errorHandler
    );
  if (result === undefined) {
    authState.value.sessionActive = false;
  }
  return result;
}
