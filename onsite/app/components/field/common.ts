import { resolveColor } from "@/composables/colors/resolveColor";
import type { ColoredLabeledValue } from "@/types/internal";

export const fieldCSS: string = "flex flex-col gap-1 ef-field";
export const fieldLabelCSS: string = "ef-field-label";
export const fieldTextCSS: string = "ef-field-text font-bold";

export function resolveColorEntry<Type>(
  entry: ColoredLabeledValue<Type>
): string {
  return resolveColor(entry.color);
}
