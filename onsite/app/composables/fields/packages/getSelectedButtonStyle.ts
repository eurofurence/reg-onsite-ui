import { resolveColorEntry } from "@/components/field/common/common";
import type { SelectButtonPassThroughMethodOptions } from "primevue/selectbutton";
import type { PackageInfo } from "@/types/internal/infos";
import type { PackageValue } from "@/types/internal/fields";

export function getSelectedButtonStyle<Type extends PackageValue>(
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
