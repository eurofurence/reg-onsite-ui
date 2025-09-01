import { getConventionSetup } from "@/composables/logic/getConventionSetup";
import type { RegNumber } from "@/types/external/attsrv/attendees/attendee";

export function getRegNumberFromRoute(): RegNumber | null {
  const regNumber: RegNumber = Number.parseInt(
    window.location.hash.slice(1)
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
