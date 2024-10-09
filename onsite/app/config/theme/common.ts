import type { UserThemeSettings } from "@/types/internal/system/theme";

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
