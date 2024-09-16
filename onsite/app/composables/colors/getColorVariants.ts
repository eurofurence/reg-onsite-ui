import type { ColorsPaletteValue } from "@/config/theme";

export function getColorVariants(
  baseColorString: ColorsPaletteValue,
  offset = 100
): [ColorsPaletteValue, ColorsPaletteValue] {
  const [color, colorValueStr] = baseColorString.split("-");
  if (colorValueStr === undefined) {
    return [baseColorString, baseColorString];
  }
  const colorValue: number = Number.parseInt(colorValueStr);
  const altColor: ColorsPaletteValue = <ColorsPaletteValue>(
    `${color}-${colorValue - offset}`
  );
  return [baseColorString, altColor];
}
