import { conventionSetup } from "@/config/convention";
import type { RouteLocationNormalizedLoaded } from "vue-router";

const route: RouteLocationNormalizedLoaded = useRoute();

export function getRegNumberFromRoute(): number | null {
  const regNumber: number = Number.parseInt(route.hash.slice(1));
  if (
    isNaN(regNumber) ||
    regNumber < 0 ||
    regNumber > conventionSetup.maxRegNumber
  ) {
    return null;
  }
  return regNumber;
}
