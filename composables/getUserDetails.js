import { fetchLoginUserGroups } from "@/composables/apiLoginUser";

export async function getUserDetails(globalState, toast) {
    var userInfo = await fetchLoginUserGroups(globalState, toast);
    // Disabled since 2FA is not yet implemented
    userInfo.onsiteFlagIsAdmin = false; // userInfo.groups.some((group) => configAdminGroups.includes(group));
    return userInfo;
}
