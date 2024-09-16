import { resolveColor } from "@/composables/colors/resolveColor";
import { ColorsPalette } from "@/config/theme";

export function getDuesStyle(value: number): any {
  if (value > 0) {
    return { color: resolveColor(ColorsPalette.red_400) };
  } else if (value < 0) {
    return { color: resolveColor(ColorsPalette.green_400) };
  } else {
    return {};
  }
}
