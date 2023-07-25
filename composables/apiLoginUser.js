import { getApi } from "@/composables/restApi";
import { onError, onFetchError } from "@/composables/restApiErrors";
import { handleLogout } from "@/composables/handleLogout";

export async function apiFetchLoginUser() {
    const response = await getApi("authsrv/v1/frontend-userinfo");
    const data = await response.json();
    return { response, data };
}

export async function fetchLoginUser(globalState, toast) {
    try {
        const { response, data } = await apiFetchLoginUser();
        if (response.ok) {
            return data;
        } else {
            onError(toast, "Frontend Service", data, response.status);
        }
    } catch (error) {
        onFetchError(toast, "Frontend Service", error);
    }
    handleLogout(globalState);
    return null;
}

export async function apiFetchLoginUserGroups() {
    const response = await getApi("authsrv/v1/userinfo");
    const data = await response.json();
    return { response, data };
}

export async function fetchLoginUserGroups(globalState, toast) {
    try {
        const { response, data } = await apiFetchLoginUserGroups();
        if (response.ok) {
            return data;
        } else {
            onError(toast, "Frontend Service", data, response.status);
        }
    } catch (error) {
        onFetchError(toast, "Frontend Service", error);
    }
    handleLogout(globalState);
    return null;
}
