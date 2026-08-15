import { getColorFromStyle } from "@/composables/colors/getColorFromStyle";
import { getColorVariants } from "@/composables/colors/getColorVariants";
import { ColorsPalette } from "@/composables/theme/colors";
import { metadataForTShirtTypePlaceholder, metadataListForTShirtTypesInternal } from "@/config/metadata/tshirt/metadataForTShirtTypes";
import { NoPackage } from "@/types/internal/missing";
import type { AttendeeStatisticEntry } from "@/composables/statistics/computeAttendeeStatisticEntries";
import type { ChartData } from "@/types/internal/statistics";

const TSHIRT_SIZE_NOT_SPECIFIED = "__tshirt_size_not_specified__";

export function getTshirtChartData(entries: AttendeeStatisticEntry[]): ChartData {
  const countMap: Record<string, number> = {};
  for (const a of entries) {
    if (a.transGoodieChoice !== null && a.transGoodieChoice !== NoPackage.no_package) {
      const size = a.tshirt_size ?? TSHIRT_SIZE_NOT_SPECIFIED;
      countMap[size] = (countMap[size] || 0) + 1;
    }
  }
  const [main, alt] = getColorVariants(ColorsPalette.orange_400);
  const bgColor = getColorFromStyle(main);
  const hoverColor = getColorFromStyle(alt);
  const tshirtChartEntries = [
    { value: TSHIRT_SIZE_NOT_SPECIFIED, label: metadataForTShirtTypePlaceholder.label },
    ...metadataListForTShirtTypesInternal,
  ];
  return {
    labels: tshirtChartEntries.map((m) => m.label),
    values: tshirtChartEntries.map((m) => m.value),
    datasets: [
      {
        label: "Count",
        data: tshirtChartEntries.map((m) => countMap[m.value] || 0),
        backgroundColor: tshirtChartEntries.map(() => bgColor),
        hoverBackgroundColor: tshirtChartEntries.map(() => hoverColor),
      },
    ],
  };
}
