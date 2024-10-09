import { setupEventListener } from "@/composables/events/setupEventListener";
import type {
  KeyMatchFunction,
  KeyboardCallback,
} from "@/types/internal/keyboard";

export function setupKeyEvents(
  eventName: string,
  matchKeyFunction: KeyMatchFunction,
  callFunction: KeyboardCallback,
  withMod = false
) {
  async function onKeyEvent(event: KeyboardEvent) {
    const isMod: boolean = event.altKey || event.ctrlKey || event.metaKey;
    if ((isMod && !withMod) || (!isMod && withMod)) {
      return;
    }
    const key: string = event.key;
    try {
      if (matchKeyFunction(key.toLowerCase())) {
        await callFunction(event);
      }
    } catch (error) {
      console.error(error);
      console.error(event);
    }
  }
  setupEventListener(window, eventName, onKeyEvent);
}
