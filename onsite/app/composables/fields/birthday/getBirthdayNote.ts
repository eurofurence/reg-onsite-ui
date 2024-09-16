import { isValidAge } from "@/composables/fields/birthday/isValidAge";

export function getBirthdayNote(age: number): string {
  if (isValidAge(age)) {
    return "";
  } else {
    return "Not old enough to attend!";
  }
}
