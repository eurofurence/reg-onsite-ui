export const enum ColorsPalette {
  text = "black",
  inverted_text = "white",
  primary_500 = "primary-500",
  primary_600 = "primary-600",
  primary_400 = "primary-400",
  surface_500 = "surface-500",

  orange_400 = "orange-400",
  yellow_400 = "yellow-400",
  green_400 = "green-400",
  red_400 = "red-400",
  gray_300 = "gray-300",
  gray_700 = "gray-700",
  gray_900 = "gray-900",
  purple_400 = "purple-400",
}
// Since color references are dynamically constructed,
// the CSS file needs explicit source entries to prevent pruning of unused colors

export type ColorsPaletteValue = `${ColorsPalette}`;
