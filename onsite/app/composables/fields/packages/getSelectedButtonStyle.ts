import { resolveColorEntry } from "@/components/field/common";
import type { PackageApiValue } from "@/types/external";
import type { PackageInfo } from "@/types/internal";
import type { SelectButtonPassThroughMethodOptions } from "primevue/selectbutton";

export function getSelectedButtonStyle<Type extends PackageApiValue | "">(
  choice: Ref<Type | null>,
  packageSubset: PackageInfo<Type>[],
  styleOptions: SelectButtonPassThroughMethodOptions
): { style: { background: string } } | {} {
  const selectedPackage: PackageInfo<Type> | undefined = packageSubset.find(
    (item) => item.value == choice.value
  );
  if (selectedPackage === undefined || !styleOptions.context.active) {
    return {
      style: {},
    };
  }
  return {
    style: {
      background: resolveColorEntry(selectedPackage),
    },
  };
}
