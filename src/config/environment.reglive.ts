import { EnvName, type EnvironmentSettings } from "@/types/internal/env";

export const defaultEnvironment: EnvironmentSettings = {
  envName: EnvName.prod,
  apiBaseUrl: new URL(import.meta.env.VITE_API_BASE_URL),
  dealerFrontdeskUrl: new URL("https://dealers.eurofurence.org/frontdesk"),
};
