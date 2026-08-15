import { fetchResultWrapper } from "@/composables/api/base/fetchResultWrapper";
import { postApi } from "@/composables/api/base/postApi";
import { type RestErrorHandler, restErrorWrapper } from "@/composables/api/base/restErrorWrapper";
import type { IdpGroupId } from "@/types/external/authsrv/frontenduserinfo";
import type { RegNumber } from "@/types/external/attsrv/attendees/attendee";
import type { ApiError } from "@/types/external/error";
import type { FetchResultPromise } from "@/types/internal/rest";

interface GroupMembersResponse {
  attendees: Array<{ id: RegNumber; nickname: string | null }>;
}

async function fetchGroupMembers(groupId: IdpGroupId, idpToken: string): FetchResultPromise<GroupMembersResponse, ApiError> {
  const response = await postApi(`onsite/api/v1/groups/${encodeURIComponent(groupId)}/attendees`, { idpToken });
  return fetchResultWrapper<GroupMembersResponse>(response);
}

export async function getGroupMembers(
  errorHandler: RestErrorHandler,
  groupId: IdpGroupId,
  idpToken: string,
): Promise<Array<{ id: RegNumber; nickname: string | null }> | undefined> {
  const result = await restErrorWrapper<GroupMembersResponse>(
    "Backend Service",
    () => fetchGroupMembers(groupId, idpToken),
    errorHandler,
  );
  return result?.attendees;
}
