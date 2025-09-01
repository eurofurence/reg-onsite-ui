import type { MoneyInCent } from "@/types/external/attsrv/attendees/attendee";

export function getDuesFlag(dues_raw: MoneyInCent): string {
  if (dues_raw > 0) {
    return "pi pi-exclamation-triangle";
  } else if (dues_raw < 0) {
    return "pi pi-money-bill";
  } else {
    return "";
  }
}
