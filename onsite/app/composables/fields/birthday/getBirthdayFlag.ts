import { isValidAge } from "@/composables/fields/birthday/isValidAge";

export function getBirthdayFlag(age: number): string {
  if (isValidAge(age)) {
    return "pi pi-check";
  } else {
    return "pi pi-calendar-times";
    // return "pi pi-exclamation-triangle";
  }
}
