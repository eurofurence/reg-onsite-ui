import { getConventionSetup } from "@/composables/logic/getConventionSetup";
import type { RouteLocationNormalizedLoaded } from "vue-router";
import type { RegNumber } from "@/types/external/attsrv/attendees/attendee";

const route: RouteLocationNormalizedLoaded = useRoute();

export function getRegNumberFromRoute(): RegNumber | null {
  const regNumber: RegNumber = Number.parseInt(
    route.hash.slice(1)
  ) as RegNumber;
  if (
    isNaN(regNumber) ||
    regNumber < 0 ||
    regNumber > getConventionSetup().maxRegNumber
  ) {
    return null;
  }
  return regNumber;
}
