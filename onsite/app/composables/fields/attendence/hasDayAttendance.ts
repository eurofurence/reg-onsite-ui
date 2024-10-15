import { getPurePackageList } from "@/composables/fields/packages/getPurePackageList";
import type { AttendanceApiValue } from "@/config/metadata/packages/metadataForAttendance";
import type { PackageApiValue } from "@/types/external/attsrv/attendees/attendee";
import type { LabeledValue } from "@/types/internal/infos";
import type { TransformedAttendeeInfo } from "@/types/internal/attendee";
import { getConventionSetup } from "@/composables/logic/getConventionSetup";

const dayAttendanceSet: Set<AttendanceApiValue> = new Set(
  getConventionSetup().metadata.forDayAttendance.list.map(
    (entry: LabeledValue<AttendanceApiValue>) => entry.value
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
      dayAttendanceSet.has(entry as AttendanceApiValue)
    ) || false
  );
}
