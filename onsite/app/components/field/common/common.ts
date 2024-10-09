import { resolveColor } from "@/composables/colors/resolveColor";
import type { ColoredLabeledValue } from "@/types/internal/infos";

export const fieldCSS: string = "flex flex-col gap-1 onsite-field";
export const fieldLabelCSS: string = "onsite-field-label";
export const fieldTextCSS: string = "onsite-field-text font-bold";

export function resolveColorEntry<Type>(
  entry: ColoredLabeledValue<Type>
): string {
  return resolveColor(entry.color);
}
