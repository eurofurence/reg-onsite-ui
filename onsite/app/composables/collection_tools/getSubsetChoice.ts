import { getFirstElementFromList } from "@/composables/collection_tools/getFirstElementFromList";
import { getSubsetList } from "@/composables/collection_tools/getSubsetList";
import type { LabeledValue } from "@/types/internal/infos";

export function getSubsetChoice<TypeSubset extends TypeSuperset, TypeSuperset>(
  data: TypeSuperset[],
  subsetItemList: LabeledValue<TypeSubset | "">[]
): TypeSubset | "" | null {
  const subsetValueList: (TypeSubset | "")[] = subsetItemList.map(
    (item) => item.value
  );
  const subsetList: (TypeSubset | "")[] | null = getSubsetList<
    TypeSubset | "",
    TypeSuperset | ""
  >(data, subsetValueList);
  return getFirstElementFromList<TypeSubset | "">(subsetList, "");
}
