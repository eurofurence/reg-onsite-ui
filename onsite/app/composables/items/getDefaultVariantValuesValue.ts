import type {
  AbstractTrinketValue,
  AbstractTrinketWithVariantsValue,
} from "@/setupEFIteration";
import type { DefaultVariantValues } from "@/types/internal";

export function getDefaultVariantValuesValue(
  defaultVariantValues: DefaultVariantValues,
  abstractTrinketValue: AbstractTrinketValue
): string | null | undefined {
  return defaultVariantValues.get(
    <AbstractTrinketWithVariantsValue>abstractTrinketValue
  );
}
