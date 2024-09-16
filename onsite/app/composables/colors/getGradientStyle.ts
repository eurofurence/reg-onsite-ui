import { resolveColor } from "@/composables/colors/resolveColor";
import type { ColorsPaletteValue } from "@/config/theme";

export function getGradientStyle(
  mainColor: ColorsPaletteValue,
  altColor: ColorsPaletteValue,
  textColor: ColorsPaletteValue
): { style: { background: string; color: string } } | {} {
  const mainColorVar: string = resolveColor(mainColor);
  const altColorVar: string = resolveColor(altColor);
  return {
    background: `linear-gradient(110deg, ${mainColorVar} 50%, ${altColorVar} 50%)`,
    color: textColor,
  };
}
