import tailwindcss from "@tailwindcss/vite";
import vue from "@vitejs/plugin-vue";
import { fileURLToPath, URL } from "node:url";
import { defineConfig } from "vite";

// https://vite.dev/config/
export default defineConfig({
  root: ".",
  server: {
    host: "localhost",
    port: 8000,
  },
  base: "/aN3nNFwFoi5QkyPaVJ54dDTDc6HrrCYGAL6U6GUuyV2uvvekgOxqYe6K2hur/onsite",
  plugins: [vue(), tailwindcss()],
  build: {
    rollupOptions: {
      input: {
        cashierdesk: "./cashierdesk.html",
        constore: "./constore.html",
        debug_fields: "./debug_fields.html",
        index: "./index.html",
        quickregdesk: "./quickregdesk.html",
        regdesk: "./regdesk.html",
        shipping: "./shipping.html",
        sponsordesk: "./sponsordesk.html",
        stats: "./stats.html",
      },
    },
  },
  resolve: {
    alias: {
      "@": fileURLToPath(new URL("./src", import.meta.url)),
    },
  },
});
