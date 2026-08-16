import { getConventionSetup } from "@/composables/logic/getConventionSetup";
import type { RegNumber } from "@/types/external/attsrv/attendees/attendee";
import type { IdpGroupId } from "@/types/external/authsrv/frontenduserinfo";
import type { AuthGroupValue } from "@/types/internal/convention";
import { ref, type Ref } from "vue";

type AuthState = {
  sessionActive: boolean;
  userName: string | null;
  userGroups: IdpGroupId[];
  userRegNumList: RegNumber[];
};

const defaultAuthState: AuthState = {
  sessionActive: false,
  userName: null,
  userGroups: [],
  userRegNumList: [],
};

export const authState: Ref<AuthState> = ref({ ...defaultAuthState });

let resolveInitialAuthCheck: () => void;
export const initialAuthCheckSettled: Promise<void> = new Promise(
  (resolve) => {
    resolveInitialAuthCheck = resolve;
  }
);
export function markInitialAuthCheckSettled(): void {
  resolveInitialAuthCheck();
}

function isIdpMember(
  ...groupIdListList: (IdpGroupId[] | undefined)[]
): boolean {
  const searchGroupList: (IdpGroupId | undefined)[] = groupIdListList.flat();
  return authState.value.userGroups.some((userGroup: IdpGroupId) =>
    searchGroupList.includes(userGroup)
  );
}

export function clearSessionState(): void {
  Object.assign(authState.value, {
    ...defaultAuthState,
    userGroups: [],
    userRegNumList: [],
  });
}

export function isInAnyGroup(...groupNameList: AuthGroupValue[]): boolean {
  if (groupNameList.length === 0) {
    return true;
  }
  const groupIdListList: (IdpGroupId[] | undefined)[] = groupNameList.map(
    (groupName: AuthGroupValue) => getConventionSetup().auth[groupName]
  );
  return (
    isIdpMember(...groupIdListList) ||
    isIdpMember(getConventionSetup().auth.admin)
  );
}
