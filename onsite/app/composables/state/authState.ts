import type { RegNumber } from "@/types/external/attsrv/attendees/attendee";
import type { IdpGroupId } from "@/types/external/authsrv/frontenduserinfo";
import { getConventionSetup } from "@/composables/logic/getConventionSetup";
import type { AuthGroupValue } from "@/types/internal/convention";

export const authState: Ref<{
  sessionActive: boolean;
  userName: string | null;
  userGroups: IdpGroupId[];
  userRegNumList: RegNumber[];
}> = ref({
  sessionActive: false,
  userName: null,
  userGroups: [],
  userRegNumList: [],
});

function isIdpMember(
  ...groupIdListList: (IdpGroupId[] | undefined)[]
): boolean {
  const searchGroupList: (IdpGroupId | undefined)[] = groupIdListList.flat();
  return authState.value.userGroups.some((userGroup: IdpGroupId) =>
    searchGroupList.includes(userGroup)
  );
}

export function isInAnyGroup(...groupNameList: AuthGroupValue[]): boolean {
  const groupIdListList: (IdpGroupId[] | undefined)[] = groupNameList.map(
    (groupName: AuthGroupValue) => getConventionSetup().auth[groupName]
  );
  return (
    isIdpMember(...groupIdListList) ||
    isIdpMember(getConventionSetup().auth.admin) ||
    true // FIXME
  );
}
