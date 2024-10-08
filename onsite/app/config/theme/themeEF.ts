import { definePreset } from "@primevue/themes";
import Aura from "@primevue/themes/aura";
import Lara from "@primevue/themes/lara";
import Nora from "@primevue/themes/nora";

const efPrimaryColors: { [key: string]: string } = {
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

const efThemeCustomization = {
  semantic: {
    primary: efPrimaryColors,
  },
};

export const EFThemeAura = definePreset(Aura, efThemeCustomization);
export const EFThemeLara = definePreset(Lara, efThemeCustomization);
export const EFThemeNora = definePreset(Nora, efThemeCustomization);
