import {
  ColorsPalette,
  type ColorsPaletteValue,
} from "@/composables/theme/colors";

export function resolveColor(color: ColorsPaletteValue): string {
  if (color == ColorsPalette.inverted_text) {
    return color;
  }
  return `var(--color-${color})`;
}
