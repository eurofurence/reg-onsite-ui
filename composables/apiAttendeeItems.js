import { getApi, postApi } from "@/composables/restApi";
import { onError, onFetchError } from "@/composables/restApiErrors";
import { handleLogout } from "@/composables/handleLogout";

const service = "Attendee Items Service";

const defaultItemsInfo = {
    issuedItems: [],
};

export function getDefaultItemsInfo() {
    return JSON.parse(JSON.stringify(defaultItemsInfo));
}

export async function apiGetAttendeeItems(regId) {
    const response = await getApi(`attsrv/api/rest/v1/attendees/${regId}/additional-info/sponsordesk`);
    const data = await response.json();
    return { response, data };
}

export async function getAttendeeItems(globalState, toast, regId) {
    const { response, data } = await apiGetAttendeeItems(regId);
    try {
        if (response.ok) {
            return data;
        } else if (response.status === 404) {
            return getDefaultItemsInfo();
        } else if (response.status === 401) {
            onError(toast, service, data, response.status);
            handleLogout(globalState);
        } else {
            onError(toast, service, data, response.status);
        }
    } catch (error) {
        onFetchError(toast, service, error);
    }
    return null;
}

export async function apiPostAttendeeItems(regId, items) {
    const response = await postApi(`attsrv/api/rest/v1/attendees/${regId}/additional-info/sponsordesk`, items);
    const data = await response.body.getReader().read();
    return { response, data };
}

export async function postAttendeeItems(globalState, toast, regId, items) {
    try {
        const { response, data } = await apiPostAttendeeItems(regId, items);
        if (response.ok) {
            return true;
        } else if (response.status === 401) {
            onError(toast, service, data, response.status);
            handleLogout(globalState);
        } else {
            onError(toast, service, data, response.status);
        }
    } catch (error) {
        onFetchError(toast, service, error);
    }
    return false;
}
