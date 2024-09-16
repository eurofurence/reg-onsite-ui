import { getColorVariants } from "@/composables/colors/getColorVariants";
import { getGradientStyle } from "@/composables/colors/getGradientStyle";
import { getStatusItem } from "@/composables/fields/status/getStatusItem";
import { Status, type StatusValues } from "@/config/setupStatus";
import { ColorsPalette, type ColorsPaletteValue } from "@/config/theme";

export function getStatusStyle(
  status: StatusValues | null
): { style: { background: string; color: string } } | {} {
  if (status === null) {
    return {};
  }
  const [mainColor, altColor]: [ColorsPaletteValue, ColorsPaletteValue] =
    getColorVariants(getStatusItem(status).color, 200);
  return getGradientStyle(mainColor, altColor, ColorsPalette.inverted_text);
}
