import { resolveColor } from "@/composables/colors/resolveColor";
import { ColorsPalette } from "@/composables/theme/colors";
import type { MoneyInCent } from "@/types/external/attsrv/attendees/attendee";

export function getDuesStyle(value: MoneyInCent): any {
  if (value > 0) {
    return { color: resolveColor(ColorsPalette.red_400) };
  } else if (value < 0) {
    return { color: resolveColor(ColorsPalette.green_400) };
  } else {
    return {};
  }
}
