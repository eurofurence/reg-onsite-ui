import { definePreset } from "@primevue/themes";
import { efPrimaryColors } from "../../config/theme";  // can't use @

import Aura from "@primevue/themes/aura";
import Lara from "@primevue/themes/lara";
import Nora from "@primevue/themes/nora";

const themeCustomization = {
  semantic: {
    primary: efPrimaryColors,
  },
};

export const EFThemeAura = definePreset(Aura, themeCustomization);
export const EFThemeLara = definePreset(Lara, themeCustomization);
export const EFThemeNora = definePreset(Nora, themeCustomization);
