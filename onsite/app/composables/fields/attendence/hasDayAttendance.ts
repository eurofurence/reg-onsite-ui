import { getPurePackageList } from "@/composables/fields/packages/getPurePackageList";
import type { DayAttendanceValue } from "@/config/packages/setupDayAttendance";
import { configDayAttendanceItems } from "@/setupEFIteration";
import type { PackageApiValue } from "@/types/external";
import type { LabeledValue, TransformedAttendeeInfo } from "@/types/internal";

const dayAttendanceSet: Set<DayAttendanceValue> = new Set(
  configDayAttendanceItems.map(
    (entry: LabeledValue<DayAttendanceValue>) => entry.value
  )
);

export function hasDayAttendance(attendee: TransformedAttendeeInfo): boolean {
  const purePackages: PackageApiValue[] | null = getPurePackageList(
    attendee.packages_list
  );
  if (purePackages === null) {
    return false;
  }
  return (
    purePackages.some((entry: PackageApiValue) =>
      dayAttendanceSet.has(<DayAttendanceValue>entry)
    ) || false
  );
}
