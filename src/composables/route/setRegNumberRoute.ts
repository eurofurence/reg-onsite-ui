import type { RegNumber } from "@/types/external/attsrv/attendees/attendee";

export function setRegNumberRoute(regNumber: RegNumber | null): void {
  if (regNumber === null) {
    window.location.hash = "";
  } else {
    window.location.hash = `#${regNumber}`;
  }
}
