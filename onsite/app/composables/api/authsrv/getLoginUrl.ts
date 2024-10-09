import { getUrl } from "@/composables/api/base/getUrl";

function getLoginApiEndpoint(dropoffURL: URL): URL {
  const appName: string = "registration-system";
  const dropoffURLEncoded: string = encodeURIComponent(dropoffURL.toString());
  return getUrl(
    `authsrv/v1/auth?app_name=${appName}&dropoff_url=${dropoffURLEncoded}`
  );
}

export function getLoginUrl(): URL {
  return getLoginApiEndpoint(new URL(window.location.href));
}
