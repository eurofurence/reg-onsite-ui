import { getPurePackageList } from "@/composables/fields/packages/getPurePackageList";
import type {
  PackageApiValue,
  PackageCountType,
} from "@/types/external/attsrv/attendees/attendee";
import type { WritableComputedRef } from "vue";

function setPurePackageList(
  new_value: PackageApiValue[]
): PackageCountType<PackageApiValue>[] {
  return new_value.map((value: PackageApiValue) => ({
    name: value,
    count: 1,
  }));
}

export function computePurePackageList(
  dataRef: Ref<PackageCountType<PackageApiValue>[] | null>
): WritableComputedRef<PackageApiValue[] | null> {
  return computed<PackageApiValue[] | null>({
    get: () => getPurePackageList(dataRef.value),
    set: (new_value: PackageApiValue[] | null) => {
      if (new_value !== null) {
        dataRef.value = setPurePackageList(new_value);
      }
    },
  });
}
