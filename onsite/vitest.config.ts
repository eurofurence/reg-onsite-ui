import { defineConfig } from "vitest/config";
import tsconfigPaths from "vite-tsconfig-paths";

export default defineConfig({
  plugins: [tsconfigPaths()],
  test: {
    alias: {
      "@/": new URL("./app/", import.meta.url).pathname,
      "~/": new URL("./app/", import.meta.url).pathname,
    },
  },
});
