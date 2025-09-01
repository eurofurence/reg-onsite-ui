import { getExclusiveFlagPresenceChecker } from "@/composables/fields/flags/getExclusiveFlagPresenceChecker";
import { getConventionSetup } from "@/composables/logic/getConventionSetup";

export const getConBookValue = getExclusiveFlagPresenceChecker(
  getConventionSetup().metadata.forConBook.list
);
