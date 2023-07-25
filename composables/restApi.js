import { getLoginURL } from "@/composables/apiLogin";

export async function confirmLogout() {
    await fetch(getLoginURL(), { mode: "no-cors", method: "GET", credentials: "include" });
    const response = await fetch(getUrl("authsrv/v1/frontend-userinfo"), {
        method: "GET",
        credentials: "include",
    });
    if (response.ok) {
        return false;
    }
    return true;
}

function getUrl(api) {
    // eslint-disable-next-line no-undef
    const config = useRuntimeConfig();
    return `${config.public.API_BASE_URL}/${api}`;
}

async function reloggingFetch(fetchUrl, fetchParameters) {
    const response = await fetch(fetchUrl, fetchParameters);
    if (response.status !== 401) {
        return response;
    }
    // Confirm Logout
    if (await confirmLogout()) {
        return response;
    }
    // Try again if relogin succeeded
    return await fetch(fetchUrl, fetchParameters);
}

export async function getApi(api) {
    return reloggingFetch(getUrl(api), {
        method: "GET",
        credentials: "include",
    });
}

export async function postApi(api, data) {
    return reloggingFetch(getUrl(api), {
        method: "POST",
        credentials: "include",
        body: JSON.stringify(data),
    });
}
