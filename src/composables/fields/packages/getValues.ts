import { getExclusivePackagePresenceChecker } from "@/composables/fields/packages/getExclusivePackagePresenceChecker";
import { getInclusivePackagePresenceChecker } from "@/composables/fields/packages/getInclusivePackagePresenceChecker";
import { getConventionSetup } from "@/composables/logic/getConventionSetup";

export const getDayAttendanceValues = getInclusivePackagePresenceChecker(
  getConventionSetup().metadata.forDayAttendance.list
);

export const getSponsorValue = getExclusivePackagePresenceChecker(
  getConventionSetup().metadata.forSponsorLevels.list
);

export const getGoodieValue = getExclusivePackagePresenceChecker(
  getConventionSetup().metadata.forGoodiesLevels.list
);
