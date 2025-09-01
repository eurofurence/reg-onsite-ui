import { environmentSettings } from "@/composables/services/environmentService";
import { EnvName } from "@/types/internal/env";

export function getInactiveStyle(): string {
  if (environmentSettings.envName === EnvName.dev) {
    return "";
  }
  return "pointer-events-none select-none";
}
