import type { UserThemeSettings } from "@/types/internal";

export const darkModeClass: string = "my-app-dark";

export const defaultUserSettings: UserThemeSettings = {
  isDarkMode: false,
  fontSize: 14,
  headerSize: 1,
};

export function getDialogBreakPoints(): { [key: string]: string } {
  return {
    "2000px": "50vw",
    "700px": "75vw",
    "500px": "100vw",
  };
}

export const efPrimaryColors: { [key: string]: string } = {
  50: "#f8fafa",
  100: "#dbe9e9",
  200: "#bfd7d7",
  300: "#a2c6c6",
  400: "#86b4b4",
  500: "#69a3a3",
  600: "#598b8b",
  700: "#4a7272",
  800: "#3a5a5a",
  900: "#2a4141",
  950: "#172424",
};

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
  gray_700 = "gray-700",
  gray_900 = "gray-900",
  purple_400 = "purple-400",
}

export type ColorsPaletteValue = `${ColorsPalette}`;
