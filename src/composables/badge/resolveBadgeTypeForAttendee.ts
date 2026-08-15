import { getValidBadgeMappingFlags } from "@/composables/badge/getValidBadgeMappingValues";
import { NO_FLAG, mappingKey } from "@/types/badgeMapping";
import type { BadgeMapping } from "@/types/badgeMapping";
import type { BadgeType } from "@/types/badgeType";
import type { TransformedAttendeeInfo } from "@/types/internal/attendee";

function splitKeyParts(value: string): string[] {
  return value.split(",");
}

function isSubsetOf(subset: string[], superset: Set<string>): boolean {
  return subset.every((entry: string) => superset.has(entry));
}

function attendeeMatchesFlagValue(
  flagValue: string,
  attendeeFlags: Set<string>
): boolean {
  if (flagValue === NO_FLAG) {
    const validFlags: string[] = getValidBadgeMappingFlags();
    return validFlags.every((flag: string) => !attendeeFlags.has(flag));
  }
  return isSubsetOf(splitKeyParts(flagValue), attendeeFlags);
}

export function resolveBadgeTypeForAttendee(
  attendee: TransformedAttendeeInfo,
  badgeMapping: BadgeMapping,
  badgeTypes: BadgeType[]
): BadgeType | null {
  const attendeePackages: Set<string> = new Set(
    (attendee.packages_list ?? []).map((pkg) => pkg.name)
  );
  const attendeeFlags: Set<string> = new Set(attendee.flags_list ?? []);

  let bestBadgeTypeId: string | null = null;
  let bestSpecificity: number = -1;
  let bestSpecificityIsAmbiguous: boolean = false;

  for (const packageValue of badgeMapping.packages) {
    const packageParts: string[] = splitKeyParts(packageValue);
    if (!isSubsetOf(packageParts, attendeePackages)) {
      continue;
    }
    for (const flagValue of badgeMapping.flags) {
      if (!attendeeMatchesFlagValue(flagValue, attendeeFlags)) {
        continue;
      }
      const flagParts: string[] =
        flagValue === NO_FLAG ? [] : splitKeyParts(flagValue);
      const badgeTypeId: string | undefined =
        badgeMapping.rules[mappingKey(packageValue, flagValue)];
      if (!badgeTypeId) {
        continue;
      }
      const specificity: number = packageParts.length + flagParts.length;
      if (specificity > bestSpecificity) {
        bestSpecificity = specificity;
        bestBadgeTypeId = badgeTypeId;
        bestSpecificityIsAmbiguous = false;
      } else if (
        specificity === bestSpecificity &&
        badgeTypeId !== bestBadgeTypeId
      ) {
        bestSpecificityIsAmbiguous = true;
      }
    }
  }

  if (bestBadgeTypeId === null || bestSpecificityIsAmbiguous) {
    return null;
  }
  return (
    badgeTypes.find((badgeType) => badgeType.id === bestBadgeTypeId) ?? null
  );
}
