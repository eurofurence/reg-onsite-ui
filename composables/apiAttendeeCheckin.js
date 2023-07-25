import { postApi } from "@/composables/restApi";
import { onError, onFetchError } from "@/composables/restApiErrors";
import { handleLogout } from "@/composables/handleLogout";

const service = "Attendee Checkin Service";

export async function apiCheckInAttendee(regId, comment) {
    const response = await postApi(`attsrv/api/rest/v1/attendees/${regId}/status`, {
        status: "checked in",
        comment: comment,
    });
    return response;
}

export async function checkinAttendee(globalState, toast, regId) {
    const comment = JSON.stringify({
        by: globalState.userName,
        where: "regdesk",
    });
    const response = await apiCheckInAttendee(regId, comment);
    try {
        const data = response.ok ? await response.body.getReader().read() : await response.json();
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
