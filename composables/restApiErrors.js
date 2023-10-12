function extractDetails(data) {
    try {
        try {
            return data.details.details[0];
        } catch (error) {
            return data.details;
        }
    } catch (error) {
        return data;
    }
}

export function onError(toast, serviceName, data, status) {
    const errorMessageMap = {
        "attendee.id.invalid": {
            message: "Invalid Attendee ID!",
            details: () => null,
        },
        "attendee.id.notfound": {
            message: "Attendee ID not found!",
            details: () => null,
        },
        "auth.unauthorized": {
            message: "Authorization required! Please press the 'Login' button!",
            details: () => extractDetails(data),
        },
        "auth.forbidden": {
            message: "Access forbidden!",
            details: () => extractDetails(data),
        },
        "status.unpaid.dues": {
            message: "Attendee hasn't fully paid yet!",
            details: () => extractDetails(data),
        },
        "status.unchanged.invalid": {
            message: "Status unchanged!",
            details: () => extractDetails(data),
        },
        "status.write.error": {
            message: "Unable to write status!",
            details: () => null,
        },
    };
    const message = errorMessageMap[data.message];
    if (message == null) {
        console.warn(data); // Keep for debugging
        console.warn(status); // Keep for debugging
    }
    const summary = message?.message || data.message;
    const details = message?.details() || data.details;
    const toastSummary = serviceName + ": " + summary;
    if (toast !== null) {
        toast.add({
            group: "global",
            severity: "error",
            summary: toastSummary,
            detail: details,
            life: 10000,
        });
    } else {
        console.error(`${toastSummary}: ${JSON.stringify(details)}`);
    }
}

export function onFetchError(toast, serviceName, error) {
    const toastSummary = serviceName + ": Unable to connect!";
    if (toast !== null) {
        toast.add({
            group: "global",
            severity: "error",
            summary: toastSummary,
            detail: error,
            life: 5000,
        });
    } else {
        console.error(`${toastSummary}: ${JSON.stringify(error)}`);
    }
}
