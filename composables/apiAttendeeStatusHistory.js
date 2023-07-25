import { getApi } from "@/composables/restApi";
import { onError, onFetchError } from "@/composables/restApiErrors";
import { handleLogout } from "@/composables/handleLogout";

const service = "Attendee Status Service";

export async function apiAttendeeStatusHistory(regId) {
    return await getApi(`attsrv/api/rest/v1/attendees/${regId}/status-history`);
}

export async function attendeeStatusHistory(globalState, toast, regId) {
    const response = await attendeeStatusHistory(regId);
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
