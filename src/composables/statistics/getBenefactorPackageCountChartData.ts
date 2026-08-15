import { getColorFromStyle } from "@/composables/colors/getColorFromStyle";
import { getColorVariants } from "@/composables/colors/getColorVariants";
import { ColorsPalette } from "@/composables/theme/colors";
import { UnusedPackages } from "@/types/external/attsrv/attendees/attendee";
import type { AttendeeStatisticEntry } from "@/composables/statistics/computeAttendeeStatisticEntries";
import type { ChartData } from "@/types/internal/statistics";

export function getBenefactorPackageCountChartData(entries: AttendeeStatisticEntry[]): ChartData {
  const frequencyByCount: Record<number, number> = {};
  for (const a of entries) {
    let benefactorCount = 0;
    for (const pkg of a.packages_list ?? []) {
      if (pkg.name === UnusedPackages.benefactor) benefactorCount += pkg.count;
    }
    frequencyByCount[benefactorCount] = (frequencyByCount[benefactorCount] || 0) + 1;
  }
  const sortedCounts = Object.keys(frequencyByCount)
    .map(Number)
    .sort((a, b) => a - b);
  const [main, alt] = getColorVariants(ColorsPalette.primary_400);
  const bgColor = getColorFromStyle(main);
  const hoverColor = getColorFromStyle(alt);
  return {
    labels: sortedCounts.map((count) => String(count)),
    values: sortedCounts.map((count) => String(count)),
    datasets: [
      {
        label: "Registrations",
        data: sortedCounts.map((count) => frequencyByCount[count] ?? 0),
        backgroundColor: sortedCounts.map(() => bgColor),
        hoverBackgroundColor: sortedCounts.map(() => hoverColor),
      },
    ],
  };
}
