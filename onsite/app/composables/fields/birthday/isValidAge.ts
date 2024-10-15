import { getConventionSetup } from "@/composables/logic/getConventionSetup";
import type { AgeInYears } from "@/types/internal/attendee";

export function isValidAge(age: AgeInYears | null): boolean {
  if (age === null) {
    return true;
  }
  return age >= getConventionSetup().minAge;
}
