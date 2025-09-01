import type {
  FontSize,
  RelativeSize,
  UserThemeSettings,
} from "@/types/internal/system/theme";

export const darkModeClass: string = "p-dark";

export const defaultUserSettings: UserThemeSettings = {
  isDarkMode: false,
  fontSize: 14 as FontSize,
  headerSize: 1 as RelativeSize,
};
