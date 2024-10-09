import { getSubsetList } from "@/composables/collection_tools/getSubsetList";
import { type WritableComputedRef, computed } from "vue";

function setSubsetList<TypeSubset extends TypeSuperset, TypeSuperset>(
  new_value: TypeSubset[],
  data: TypeSuperset[],
  subset: TypeSubset[]
): TypeSuperset[] {
  const invertedList: TypeSuperset[] = data.filter(
    (value: TypeSuperset) => !(subset as TypeSuperset[]).includes(value)
  );
  return invertedList.concat(new_value);
}

export function computeSubsetList<
  TypeSubset extends TypeSuperset,
  TypeSuperset
>(
  dataRef: Ref<TypeSuperset[] | null>,
  subset: TypeSubset[]
): WritableComputedRef<TypeSubset[] | null> {
  return computed<TypeSubset[] | null>({
    get: () => {
      return getSubsetList<TypeSubset, TypeSuperset>(dataRef.value, subset);
    },
    set: (new_value: TypeSubset[] | null) => {
      if (dataRef.value === null || new_value === null) {
        return;
      }
      dataRef.value = setSubsetList<TypeSubset, TypeSuperset>(
        new_value,
        dataRef.value,
        subset
      );
    },
  });
}
