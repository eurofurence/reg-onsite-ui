import { darkModeClass, defaultUserSettings } from "@/config/theme/common";
import { isDarkMode } from "@/composables/theme/isDarkMode";
import type { FontSize, RelativeSize } from "@/types/internal/system/theme";

const themeSettings = useSmartCookie("onsiteTheme", defaultUserSettings);

function setStylesheetVariables(
  fontSize: FontSize,
  headerSize: RelativeSize
): void {
  document.documentElement.style.fontSize = `${fontSize}px`;
  document.documentElement.style.setProperty("--header-size", `${headerSize}`);
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

watch(themeSettings, initTheme, { immediate: true });
