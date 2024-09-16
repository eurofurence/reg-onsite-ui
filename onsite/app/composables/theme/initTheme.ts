import { darkModeClass, defaultUserSettings } from "../../config/theme";
import { isDarkMode } from "./isDarkMode";

const themeSettings = useSmartCookie("onsiteTheme", defaultUserSettings);

function setStylesheetVariables(fontSize: number, headerSize: number): void {
  document.documentElement.style.fontSize = `${fontSize}px`;
  document.documentElement.style.setProperty("--header-size", `${headerSize}`);
}

export function initTheme(): void {
  setStylesheetVariables(
    themeSettings.value.fontSize,
    themeSettings.value.headerSize
  );
  const element = document.querySelector("html");
  isDarkMode.value = themeSettings.value.isDarkMode;
  if (element !== null) {
    if (themeSettings.value.isDarkMode) {
      element.classList.add(darkModeClass);
    } else {
      element.classList.remove(darkModeClass);
    }
  }
}
watch(themeSettings, initTheme, { immediate: true });
