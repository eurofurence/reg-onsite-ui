import { conventionSetup } from "@/config/convention";

export function isValidAge(age: number): boolean {
  return age >= conventionSetup.minAge;
}
