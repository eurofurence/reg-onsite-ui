import { isValidAge } from "@/composables/fields/birthday/isValidAge";
import type { AgeInYears } from "@/types/internal/attendee";

export function getBirthdayFlag(age: AgeInYears | null): string {
  if (isValidAge(age)) {
    return "pi pi-check";
  } else {
    return "pi pi-calendar-times";
    // return "pi pi-exclamation-triangle";
  }
}
