import { setupGroupsAdmin, setupGroupsDealersDen } from "@/config/auth";

function checkGroupMembership(
  userGroupIdList: string[],
  groupIdList: string[]
): boolean {
  return userGroupIdList.some((group) => groupIdList.includes(group));
}

export const authState: Ref<{
  sessionActive: boolean;
  userName: string | null;
  userGroups: string[];
  userCanAccessDDFrontdesk: boolean;
  userIsAdmin: boolean;
  userIsDDMember: boolean;
}> = ref({
  sessionActive: false,
  userName: null,
  userGroups: [],
  userCanAccessDDFrontdesk: true,
  userIsAdmin: computed<boolean>(() =>
    checkGroupMembership(authState.value.userGroups, setupGroupsAdmin)
  ),
  userIsDDMember: computed<boolean>(() =>
    checkGroupMembership(authState.value.userGroups, setupGroupsDealersDen)
  ),
});
