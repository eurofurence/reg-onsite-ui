import type { LabeledValue } from "@/types/internal/infos";

export function getFirstValueFromLabeledValueList<
  TypeSubset extends TypeSuperset,
  TypeSuperset
>(
  data: TypeSuperset[],
  subsetItemList: LabeledValue<TypeSubset>[]
): TypeSubset | null {
  const firstSubsetItem: LabeledValue<TypeSubset> | undefined =
    subsetItemList.find((item: LabeledValue<TypeSubset>) =>
      data.includes(item.value)
    );
  return firstSubsetItem ? firstSubsetItem.value : null;
}
