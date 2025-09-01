import { getValidFlagValuesFromLabeledValues } from "@/composables/fields/flags/getValidFlagValuesFromLabeledValues";
import type { FlagApiValue } from "@/types/external/attsrv/attendees/attendee";
import type { FlagValue } from "@/types/internal/fields";
import type { LabeledValue } from "@/types/internal/infos";
import { NoFlag } from "@/types/internal/missing";

export function getExclusiveFlagPresenceChecker<OutputType extends FlagValue>(
  subsetItemList: LabeledValue<OutputType>[]
): (data: FlagApiValue[]) => OutputType {
  const validSubsetValues: FlagApiValue[] =
    getValidFlagValuesFromLabeledValues(subsetItemList);

  return function getExclusiveFlagPresence(data: FlagApiValue[]): OutputType {
    const match: FlagApiValue | undefined = data.find(
      (flagValue: FlagApiValue) => validSubsetValues.includes(flagValue)
    );
    return (match ?? NoFlag.no_flag) as OutputType;
  };
}
