import { isValidAge } from "@/composables/fields/birthday/isValidAge";
import type { AgeInYears } from "@/types/internal/attendee";

export function getBirthdayNote(age: AgeInYears | null): string {
  if (isValidAge(age)) {
    return "";
  } else {
    return "Not old enough to attend!";
  }
}
