import { postApi } from "@/composables/restApi";
import { onError, onFetchError } from "@/composables/restApiErrors";
import { handleLogout } from "@/composables/handleLogout";

const service = "Attendee Information Service";

export async function apiGetSingleAttendee(regId) {
    const response = await postApi(`attsrv/api/rest/v1/attendees/find`, {
        match_any: [
            {
                ids: [regId],
            },
        ],
    });
    const data = await response.json();
    return { response, data };
}

export async function getSingleAttendee(globalState, toast, regId) {
    const { response, data } = await apiGetSingleAttendee(regId);
    try {
        if (response.ok) {
            if (data.attendees?.length === 1) {
                return data.attendees[0];
            } else {
                return null;
            }
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

export async function apiGetAttendees(params) {
    const response = await postApi(`attsrv/api/rest/v1/attendees/find`, params);
    const data = await response.json();
    return { response, data };
}

export async function getAttendees(globalState, toast, params) {
    const { response, data } = await apiGetAttendees(params);
    try {
        if (response.ok) {
            return data.attendees;
        } else if (response.status === 401) {
            onError(toast, service, data, response.status);
            if (globalState !== null) {
                handleLogout(globalState);
            }
        } else {
            onError(toast, service, data, response.status);
        }
    } catch (error) {
        onFetchError(toast, service, error);
    }
    return null;
}
