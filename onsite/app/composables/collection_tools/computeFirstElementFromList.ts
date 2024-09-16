import { getFirstElementFromList } from "@/composables/collection_tools/getFirstElementFromList";
import { type WritableComputedRef, computed } from "vue";

function setFirstElementFromList<Type>(
  new_value: Type,
  emptyValue: Type
): Type[] {
  if (new_value == emptyValue) {
    return [];
  } else {
    return [new_value];
  }
}

export function computeFirstElementFromList<Type>(
  dataRef: Ref<Type[] | null>,
  emptyValue: Type
): WritableComputedRef<Type | null> {
  return computed<Type | null>({
    get: () => getFirstElementFromList(dataRef.value, emptyValue),
    set: (new_value) => {
      if (new_value !== null) {
        dataRef.value = setFirstElementFromList(new_value, emptyValue);
      }
    },
  });
}
