import { ColorsPalette, type ColorsPaletteValue } from "@/config/theme";

export function resolveColor(color: ColorsPaletteValue): string {
  if (color == ColorsPalette.inverted_text) {
    return color;
  }
  return `var(--p-${color})`;
}
