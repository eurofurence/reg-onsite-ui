import { getConventionSetup } from "@/composables/logic/getConventionSetup";
import { isDarkMode } from "@/composables/theme/isDarkMode";
import { useSmartCookie } from "@/composables/useSmartCookie";
import { darkModeClass, defaultUserSettings } from "@/config/theme/common";
import type { ThemeColorPalette } from "@/types/internal/convention";
import type {
  FontSize,
  RelativeSize,
  UserThemeSettings,
} from "@/types/internal/system/theme";
import type { Ref } from "vue";

export const themeSettings: Ref<UserThemeSettings> = useSmartCookie(
  "onsiteTheme",
  defaultUserSettings
);

function setStylesheetVariables(
  fontSize: FontSize,
  headerSize: RelativeSize
): void {
  document.documentElement.style.fontSize = `${fontSize}px`;
  document.documentElement.style.setProperty("--header-size", `${headerSize}`);
  const colorPalette: ThemeColorPalette = getConventionSetup().colorPalette;
  Object.keys(colorPalette).forEach((key) => {
    document.documentElement.style.setProperty(
      `--p-primary-${key}`,
      colorPalette[key]!
    );
  });
}

function toggleGlobalStyleSheetClass(className: string, value: boolean): void {
  const element = document.querySelector("html");
  if (element !== null) {
    if (value) {
      element.classList.add(className);
    } else {
      element.classList.remove(className);
    }
  }
}

export function initTheme(): void {
  setStylesheetVariables(
    themeSettings.value.fontSize,
    themeSettings.value.headerSize
  );
  toggleGlobalStyleSheetClass(darkModeClass, themeSettings.value.isDarkMode);
  isDarkMode.value = themeSettings.value.isDarkMode;
}
