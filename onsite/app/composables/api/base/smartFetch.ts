import { getUrl } from "@/composables/api/base/getUrl";
import { getLoginUrl } from "@/composables/api/getLoginUrl";

async function tryTokenRefresh(): Promise<void> {
  await fetch(getLoginUrl(), {
    mode: "no-cors",
    method: "GET",
    credentials: "include",
  });
}

async function checkLoginStatus(): Promise<boolean> {
  const checkUrl: URL = getUrl("authsrv/v1/frontend-userinfo");
  const response: Response = await fetch(checkUrl, {
    method: "GET",
    credentials: "include",
  });
  if (response.ok) {
    return false;
  }
  return true;
}

async function confirmLogout(): Promise<boolean> {
  // Try to relog before confirming logout
  await tryTokenRefresh();
  return await checkLoginStatus();
}

export async function smartFetch(
  fetchUrl: URL,
  fetchParameters: RequestInit
): Promise<Response> {
  const response: Response = await fetch(fetchUrl, fetchParameters);
  if (response.status !== 401) {
    return response;
  }
  // Confirm Logout
  if (await confirmLogout()) {
    return response;
  }
  // Try again if relogin succeeded
  return await fetch(fetchUrl, fetchParameters);
}
