import type { DefaultVariantValues } from "@/types/internal/goodies";
import type {
  AbstractGoodieValue,
  AbstractGoodieWithVariantsValue,
} from "@/config/convention";

export function getDefaultVariantValuesValue(
  defaultVariantValues: DefaultVariantValues,
  abstractGoodieValue: AbstractGoodieValue
): string | null | undefined {
  return defaultVariantValues.get(
    abstractGoodieValue as AbstractGoodieWithVariantsValue
  );
}
