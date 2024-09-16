import { computeFirstElementFromList } from "@/composables/collection_tools/computeFirstElementFromList";
import { computeSubsetList } from "@/composables/collection_tools/computeSubsetList";
import { computePurePackageList } from "@/composables/fields/packages/computePurePackageList";
import type { PackageApiValue, PackageCountType } from "@/types/external";
import type { LabeledValue } from "@/types/internal";
import type { WritableComputedRef } from "vue";

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
    computeSubsetList<Type | "", PackageApiValue | "">(
      purePackagesList,
      subsetValueList
    );
  return computeFirstElementFromList<Type | "">(subsetList, "");
}
