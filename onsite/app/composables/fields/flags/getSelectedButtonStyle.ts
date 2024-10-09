import { resolveColorEntry } from "@/components/field/common/common";
import type { ColoredLabeledValue } from "@/types/internal/infos";
import type { SelectButtonPassThroughMethodOptions } from "primevue/selectbutton";
import type { FlagValue } from "@/types/internal/fields";

export function getSelectedButtonStyle<Type extends FlagValue>(
  choice: Ref<Type | null>,
  packageSubset: ColoredLabeledValue<Type>[],
  styleOptions: SelectButtonPassThroughMethodOptions
): { style: { background: string } } | {} {
  const selectedPackage: ColoredLabeledValue<Type> | undefined =
    packageSubset.find((item) => item.value == choice.value);
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
