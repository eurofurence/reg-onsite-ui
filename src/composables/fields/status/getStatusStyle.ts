import { getColorVariants } from "@/composables/colors/getColorVariants";
import { getGradientStyle } from "@/composables/colors/getGradientStyle";
import { getStatusItem } from "@/composables/fields/status/getStatusItem";
import {
  ColorsPalette,
  type ColorsPaletteValue,
} from "@/composables/theme/colors";
import { isDarkMode } from "@/composables/theme/isDarkMode";
import type { AttendeeApiStatusValues } from "@/config/metadata/metadataForStatus";

export function getStatusStyle(
  status: AttendeeApiStatusValues | null
): { style: { background: string; color: string } } | {} {
  if (status === null) {
    return {};
  }
  const [mainColor, altColor]: [ColorsPaletteValue, ColorsPaletteValue] =
    getColorVariants(getStatusItem(status).color, 200);

  return getGradientStyle(
    mainColor,
    altColor,
    isDarkMode.value ? ColorsPalette.text : ColorsPalette.inverted_text
  );
}
