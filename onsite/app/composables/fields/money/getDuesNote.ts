import type { MoneyInCent } from "@/types/external/attsrv/attendees/attendee";

export function getDuesNote(dues_raw: MoneyInCent): string {
  if (dues_raw > 0) {
    return "Not fully paid yet!";
  } else if (dues_raw < 0) {
    return "Too much paid!";
  } else {
    return "";
  }
}
