import { getAge } from "@/composables/getAge";

export function canCheckin(attendee) {
    if (attendee.status !== "paid") {
        return false;
    }
    if (attendee.current_dues > 0) {
        return false;
    }
    if (getAge(attendee.birthday) < 18) {
        return false;
    }
    return true;
}
