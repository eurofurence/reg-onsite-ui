export function getAge(birthday) {
    const years = new Date(new Date() - new Date(birthday)).getFullYear() - 1970;
    return years;
}

export function getBirthdayFlag(birthday) {
    if (getAge(birthday) < 18) {
        return "pi pi-calendar-times";
        // return "pi pi-exclamation-triangle";
    } else {
        return "";
    }
}

export function getBirthdayNote(birthday) {
    if (getAge(birthday) < 18) {
        return "Not 18 years old!";
    } else {
        return "";
    }
}
