import { EFThemeNora } from "./app/composables/theme/presets";
import { darkModeClass } from "./app/config/theme";

export default defineNuxtConfig({
  future: {
    compatibilityVersion: 4,
  },
  app: {
    baseURL:
      "/aN3nNFwFoi5QkyPaVJ54dDTDc6HrrCYGAL6U6GUuyV2uvvekgOxqYe6K2hur/onsite/",
  },
  css: [
    "primeicons/primeicons.css",
    "flag-icons/css/flag-icons.min.css",
    "keyboard-css/dist/css/main.css",
  ],
  compatibilityDate: "2024-08-29",
  devtools: {
    enabled: true,
    timeline: {
      enabled: true,
    },
  },
  modules: ["@primevue/nuxt-module", "@nuxtjs/tailwindcss", "@nuxt/image"],
  build: {
    transpile: ["primevue"],
  },
  devServer: {
    port: 8000,
  },
  ssr: false,
  postcss: {
    plugins: {
      tailwindcss: {},
      autoprefixer: {},
    },
  },
  primevue: {
    autoImport: true,
    usePrimeVue: true,
    options: {
      theme: {
        preset: EFThemeNora,
        options: {
          darkModeSelector: `.${darkModeClass}`,
        },
      },
    },
  },
});