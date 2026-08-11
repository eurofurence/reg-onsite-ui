import { fetchResultWrapper } from "@/composables/api/base/fetchResultWrapper";
import { getApi } from "@/composables/api/base/getApi";
import {
  type RestErrorHandler,
  restErrorWrapper,
} from "@/composables/api/base/restErrorWrapper";
import type { IdpGroupId } from "@/types/external/authsrv/frontenduserinfo";
import type { ApiError } from "@/types/external/error";
import type { FetchResultPromise } from "@/types/internal/rest";

type ApiGroupsResponse = {
  groups: IdpGroupId[];
};

async function fetchGroups(): FetchResultPromise<ApiGroupsResponse, ApiError> {
  const response: Response = await getApi("onsite/api/groups");
  return fetchResultWrapper<ApiGroupsResponse>(response);
}

export async function getGroups(
  errorHandler: RestErrorHandler
): Promise<IdpGroupId[] | undefined> {
  const result: ApiGroupsResponse | undefined =
    await restErrorWrapper<ApiGroupsResponse>(
      "Backend Service",
      fetchGroups,
      errorHandler
    );
  return result?.groups;
}
