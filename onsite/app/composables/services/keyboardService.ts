import { setupKeyEvents } from "@/composables/events/setupKeyEvents";
import type { KeyMatchFunction, KeyboardCallback } from "@/types/internal";

export const enum ShortcutScope {
  debug = "debug",
  keypad = "keypad",
  items = "items",
}

export const enum ShortcutEvent {
  keydown = "keydown",
  keyup = "keyup",
}

export const enum ShortcutKey {
  number = "number",
  escape = "escape",
  backspace = "backspace",
  enter = "enter",
  key_s = "s",
  key_a = "a",
  key_q = "q",
}

function getSimpleKeyMatchFunction(triggerKey: string) {
  return (key: string) => key === triggerKey;
}

const keyMatchMap = new Map<ShortcutKey, KeyMatchFunction>([
  [ShortcutKey.number, (key) => "0123456789".includes(key)],
  [ShortcutKey.escape, getSimpleKeyMatchFunction("escape")],
  [ShortcutKey.backspace, getSimpleKeyMatchFunction("backspace")],
  [ShortcutKey.enter, getSimpleKeyMatchFunction("enter")],
  [ShortcutKey.key_s, getSimpleKeyMatchFunction("s")],
  [ShortcutKey.key_a, getSimpleKeyMatchFunction("a")],
  [ShortcutKey.key_q, getSimpleKeyMatchFunction("q")],
]);

function registerShortcuts(
  source: ShortcutScope,
  event: ShortcutEvent,
  triggerKey: ShortcutKey,
  handler: KeyboardCallback,
  withModifier = false
): void {
  const matchFunction: KeyMatchFunction | undefined =
    keyMatchMap.get(triggerKey);
  if (matchFunction === undefined) {
    throw new Error(`Please check trigger key ${triggerKey}!`);
  }
  setupKeyEvents(event, matchFunction, handler, withModifier);
}

interface KeyboardService {
  registerShortcuts: typeof registerShortcuts;
}

export const keyboardService: KeyboardService = {
  registerShortcuts: registerShortcuts,
};
