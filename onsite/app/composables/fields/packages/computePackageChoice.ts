import { computeFirstElementFromList } from "@/composables/collection_tools/computeFirstElementFromList";
import { computeSubsetList } from "@/composables/collection_tools/computeSubsetList";
import { computePurePackageList } from "@/composables/fields/packages/computePurePackageList";
import type {
  PackageApiValue,
  PackageCountType,
} from "@/types/external/attsrv/attendees/attendee";
import type { LabeledValue } from "@/types/internal/infos";
import type { WritableComputedRef } from "vue";
import type { PackageValue } from "@/types/internal/fields";

export function computePackageChoice<Type extends PackageApiValue>(
  dataRef: Ref<PackageCountType<PackageApiValue>[] | null>,
  subsetItemList: LabeledValue<Type | "">[]
): WritableComputedRef<Type | "" | null> {
  const subsetValueList: (Type | "")[] = subsetItemList.map(
    (item) => item.value
  );
  const purePackagesList: WritableComputedRef<PackageApiValue[] | null> =
    computePurePackageList(dataRef);
  const subsetList: WritableComputedRef<(Type | "")[] | null> =
    computeSubsetList<Type | "", PackageValue>(
      purePackagesList,
      subsetValueList
    );
  return computeFirstElementFromList<Type | "">(subsetList, "");
}
