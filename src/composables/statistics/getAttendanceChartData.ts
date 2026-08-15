import { getAttendanceConfigItems } from "@/composables/fields/packages/getValues";
import { EMPTY_LIST_SENTINEL } from "@/composables/filter/getMatcherListAgainstList";
import { getDiagramDataFromList } from "@/composables/statistics/getDiagramDataFromList";
import { ColorsPalette } from "@/composables/theme/colors";
import { AttendeeApiAttendance } from "@/config/metadata/packages/metadataForAttendance";
import type { AttendeeStatisticEntry } from "@/composables/statistics/computeAttendeeStatisticEntries";
import type { ChartData } from "@/types/internal/statistics";

const attendanceApiValues = new Set<string>(Object.values(AttendeeApiAttendance));

export function getAttendanceChartData(entries: AttendeeStatisticEntry[]): ChartData {
  const values = entries.map((a) => {
    const pkg = (a.packages_list ?? []).find((p) => attendanceApiValues.has(p.name));
    return pkg?.name ?? EMPTY_LIST_SENTINEL;
  });
  return getDiagramDataFromList(
    values,
    [
      ...getAttendanceConfigItems(),
      { value: EMPTY_LIST_SENTINEL, label: "No package on record" },
    ],
    { color: ColorsPalette.primary_400 }
  );
}
