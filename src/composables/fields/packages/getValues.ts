import { getExclusivePackagePresenceChecker } from "@/composables/fields/packages/getExclusivePackagePresenceChecker";
import { getInclusivePackagePresenceChecker } from "@/composables/fields/packages/getInclusivePackagePresenceChecker";
import { getConventionSetup } from "@/composables/logic/getConventionSetup";
import { AttendeeApiAttendance } from "@/config/metadata/packages/metadataForAttendance";
import type { PackageCountType } from "@/types/external/attsrv/attendees/attendee";
import type { AttendanceValue } from "@/config/metadata/packages/metadataForAttendance";
import type { AttendanceInfo } from "@/types/internal/infos";

export function getAttendanceConfigItems(): AttendanceInfo[] {
  const fullAttendanceEntry: AttendanceInfo | undefined =
    getConventionSetup().metadata.forAttendance.list.find(
      (entry) => entry.value === AttendeeApiAttendance.full
    );
  const dayAttendanceList: AttendanceInfo[] =
    getConventionSetup().metadata.forDayAttendance.list;
  return fullAttendanceEntry
    ? [fullAttendanceEntry, ...dayAttendanceList]
    : dayAttendanceList;
}

export const getDayAttendanceValues: (
  packages_list: PackageCountType[]
) => AttendanceValue[] = getInclusivePackagePresenceChecker(
  getAttendanceConfigItems()
);

export const getSponsorValue = getExclusivePackagePresenceChecker(
  getConventionSetup().metadata.forSponsorLevels.list
);

export const getGoodieValue = getExclusivePackagePresenceChecker(
  getConventionSetup().metadata.forGoodiesLevels.list
);
