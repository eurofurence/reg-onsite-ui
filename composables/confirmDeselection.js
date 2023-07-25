export function confirmDeselect(confirm, attendeeInfoSelected, activeConfirm) {
    if (attendeeInfoSelected.value?.status !== "checked in") {
        activeConfirm.value = true;
        confirm.require({
            group: "confirm",
            message: "The attendee was not checked in! Do you want to continue without checking in?",
            header: "Confirm",
            icon: "pi pi-question-circle",
            accept: () => {
                attendeeInfoSelected.value = null;
                activeConfirm.value = false;
            },
            reject: () => {
                activeConfirm.value = false;
            },
        });
    } else {
        attendeeInfoSelected.value = null;
    }
}
