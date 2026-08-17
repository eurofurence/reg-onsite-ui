import { getLoginUrl } from "@/composables/api/authsrv/getLoginUrl";
import { getUrl } from "@/composables/api/base/getUrl";

async function tryTokenRefresh(): Promise<void> {
  await fetch(getLoginUrl(), {
    mode: "no-cors",
    method: "GET",
    credentials: "include",
  });
}

async function isSessionExpired(): Promise<boolean> {
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
  return await isSessionExpired();
}

let pendingConfirmLogout: Promise<boolean> | null = null;

async function confirmLogoutOnce(): Promise<boolean> {
  if (pendingConfirmLogout === null) {
    pendingConfirmLogout = confirmLogout().finally(() => {
      pendingConfirmLogout = null;
    });
  }
  return await pendingConfirmLogout;
}

const RETRYABLE_STATUS = 503;
const MAX_RETRIES = 3;
const BASE_DELAYS_MS = [500, 1000, 2000];

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function delayWithJitter(baseMs: number): number {
  const jitter = baseMs * 0.3 * (Math.random() * 2 - 1);
  return baseMs + jitter;
}

async function fetchOnce(
  fetchUrl: URL,
  fetchParameters: RequestInit
): Promise<Response> {
  const response: Response = await fetch(fetchUrl, fetchParameters);
  if (response.status !== 401) {
    return response;
  }
  // Confirm Logout
  if (await confirmLogoutOnce()) {
    return response;
  }
  // Try again if relogin succeeded
  return await fetch(fetchUrl, fetchParameters);
}

export async function smartFetch(
  fetchUrl: URL,
  fetchParameters: RequestInit
): Promise<Response> {
  for (let attempt = 0; ; attempt++) {
    try {
      const response = await fetchOnce(fetchUrl, fetchParameters);
      if (response.status !== RETRYABLE_STATUS || attempt >= MAX_RETRIES) {
        return response;
      }
    } catch (error) {
      if (attempt >= MAX_RETRIES) {
        throw error;
      }
    }
    await sleep(delayWithJitter(BASE_DELAYS_MS[attempt]!));
  }
}
