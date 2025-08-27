import { EnvName, type EnvironmentSettings } from "@/types/internal/env";

export const defaultEnvironment: EnvironmentSettings = {
  envName: EnvName.dev,
  apiBaseUrl: new URL("https://....eurofurence.org/..."),
  dealerFrontdeskUrl: new URL("https://....eurofurence.org/frontdesk"),
};
