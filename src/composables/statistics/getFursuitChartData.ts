import { getColorFromStyle } from "@/composables/colors/getColorFromStyle";
import { getColorVariants } from "@/composables/colors/getColorVariants";
import { ColorsPalette } from "@/composables/theme/colors";
import { UnusedPackages } from "@/types/external/attsrv/attendees/attendee";
import type { AttendeeStatisticEntry } from "@/composables/statistics/computeAttendeeStatisticEntries";
import type { ChartData } from "@/types/internal/statistics";

export function getFursuitChartData(entries: AttendeeStatisticEntry[]): ChartData {
  let badgeCount = 0;
  let addCount = 0;
  for (const a of entries) {
    for (const pkg of a.packages_list ?? []) {
      if (pkg.name === UnusedPackages.fursuit_badge) badgeCount += pkg.count;
      if (pkg.name === UnusedPackages.fursuit_add) addCount += pkg.count;
    }
  }
  const [main, alt] = getColorVariants(ColorsPalette.purple_400);
  const bgColor = getColorFromStyle(main);
  const hoverColor = getColorFromStyle(alt);
  return {
    labels: ["Fursuit Badge", "Fursuit Add-on"],
    values: [UnusedPackages.fursuit_badge, UnusedPackages.fursuit_add],
    datasets: [
      {
        label: "Count",
        data: [badgeCount, addCount],
        backgroundColor: [bgColor, bgColor],
        hoverBackgroundColor: [hoverColor, hoverColor],
      },
    ],
  };
}
