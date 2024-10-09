import { computeFirstElementFromList } from "@/composables/collection_tools/computeFirstElementFromList";
import { computeSubsetList } from "@/composables/collection_tools/computeSubsetList";
import type { FlagApiValue } from "@/types/external/attsrv/attendees/attendee";
import type { LabeledValue } from "@/types/internal/infos";
import type { WritableComputedRef } from "vue";

export function computeFlagsChoice<
  InputType extends FlagApiValue,
  OutputType extends InputType
>(
  dataRef: Ref<InputType[] | null>,
  subsetItemList: LabeledValue<OutputType | "">[]
): WritableComputedRef<OutputType | "" | null> {
  const flagsOptions: (OutputType | "")[] = subsetItemList
    .filter((value: LabeledValue<OutputType | "">) => value.value != "")
    .map((value: LabeledValue<OutputType | "">) => value.value);
  const flagsSubset: WritableComputedRef<(OutputType | "")[] | null> =
    computeSubsetList<OutputType | "", InputType | "">(dataRef, flagsOptions);
  return computeFirstElementFromList<OutputType | "" | null>(flagsSubset, "");
}
