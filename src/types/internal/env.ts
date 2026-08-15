import type { NavFieldset } from "@/types/internal/nav";

export const enum EnvName {
  dev = "dev",
  prod = "prod",
  prod_old = "prod_old",
}

export type EnvNameValue = `${EnvName}`;

export interface EnvironmentSettings {
  envName: EnvNameValue;
  apiBaseUrl: URL;
  externalFieldsets: NavFieldset[];
}
