import { setupRegNum } from "@/config/setupReg";
import type { RouteLocationNormalizedLoaded } from "vue-router";

const route: RouteLocationNormalizedLoaded = useRoute();

export function getRegNumberFromRoute(): number | null {
  const regNumber: number = Number.parseInt(route.hash.slice(1));
  if (
    isNaN(regNumber) ||
    regNumber < 0 ||
    regNumber > setupRegNum.maxRegNumber
  ) {
    return null;
  }
  return regNumber;
}
