import { useToast } from "primevue";
import type { ToastMessageOptions } from "primevue/toast";
import type { ToastServiceMethods } from "primevue/toastservice";

// Suppresses duplicate toasts (same severity/summary/detail) shown across any
// component within this window, e.g. when multiple independent requests fail
// in parallel and each would otherwise raise its own near-identical toast.
const DUPLICATE_WINDOW_MS = 4000;

// Shared across all OnsiteToastService instances (one per component) since
// they all funnel into the same underlying PrimeVue toast bus.
const recentlyShown = new Map<string, number>();

function toDedupeKey(message: ToastMessageOptions): string {
  return JSON.stringify([message.severity, message.summary, message.detail]);
}

function isDuplicate(message: ToastMessageOptions): boolean {
  const key = toDedupeKey(message);
  const now = Date.now();
  for (const [existingKey, shownAt] of recentlyShown) {
    if (now - shownAt > DUPLICATE_WINDOW_MS) recentlyShown.delete(existingKey);
  }
  if (recentlyShown.has(key)) return true;
  recentlyShown.set(key, now);
  return false;
}

export class OnsiteToastService {
  toastService: ToastServiceMethods;
  toastGroup: string;
  defaultToastMessage: ToastMessageOptions;

  constructor(componentId: string) {
    this.toastService = useToast();
    this.toastGroup = `toast${componentId}`;
    this.defaultToastMessage = {
      group: this.toastGroup,
    };
  }

  add(message: ToastMessageOptions) {
    const fullMessage = { ...this.defaultToastMessage, ...message };
    if (isDuplicate(fullMessage)) return;
    this.toastService.add(fullMessage);
  }

  remove(message: ToastMessageOptions) {
    this.toastService.remove({
      ...this.defaultToastMessage,
      ...message,
    });
  }
}
