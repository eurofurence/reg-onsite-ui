import { minAge } from "@/config/setupReg";

export function isValidAge(age: number): boolean {
  return age >= minAge;
}
