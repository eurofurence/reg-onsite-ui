import { resolveColorEntry } from "@/components/field/common";
import type { FlagApiValue } from "@/types/external";
import type { ColoredLabeledValue } from "@/types/internal";
import type { SelectButtonPassThroughMethodOptions } from "primevue/selectbutton";

export function getSelectedButtonStyle<Type extends FlagApiValue | "">(
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
