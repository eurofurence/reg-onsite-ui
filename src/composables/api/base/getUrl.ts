import { environmentSettings } from "@/composables/services/environmentService";

export function getUrl(api: string): URL {
  const fullUrl: URL = new URL(`${environmentSettings.apiBaseUrl}/${api}`);
  return fullUrl;
}
