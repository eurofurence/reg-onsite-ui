export function confirmIfDirty(dialog, isDirty, call) {
    if (isDirty) {
        dialog.require({
            group: "confirm",
            message: "There are unsaved changes! Are you sure you want to proceed?",
            header: "Confirmation",
            icon: "pi pi-exclamation-triangle",
            accept: () => {
                call();
            },
            reject: () => {},
        });
    } else {
        call();
    }
}
