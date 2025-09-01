import { getSubsetList } from "@/composables/collection_tools/subsets/getSubsetList";
import { setSubsetList } from "@/composables/collection_tools/subsets/setSubsetList";
import { type Ref, type WritableComputedRef, computed } from "vue";

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
