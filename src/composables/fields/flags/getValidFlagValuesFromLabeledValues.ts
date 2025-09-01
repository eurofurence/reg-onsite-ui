import type { FlagApiValue } from "@/types/external/attsrv/attendees/attendee";
import type { FlagValue } from "@/types/internal/fields";
import type { LabeledValue } from "@/types/internal/infos";
import { NoFlag } from "@/types/internal/missing";

export function getValidFlagValuesFromLabeledValues<
  OutputType extends FlagValue
>(subsetItemList: LabeledValue<OutputType>[]): FlagApiValue[] {
  return subsetItemList
    .map((entry) => entry.value)
    .filter((value) => value !== NoFlag.no_flag) as FlagApiValue[];
}
