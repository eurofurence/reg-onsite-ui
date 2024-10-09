import { setupKeyEvents } from "@/composables/events/setupKeyEvents";
import type {
  KeyboardCallback,
  KeyMatchFunction,
} from "@/types/internal/keyboard";

export const enum ShortcutScope {
  debug = "debug",
  keypad = "keypad",
  items = "items",
  confirm_checkin = "confirm_checkin",
  confirm_deselect_not_checkin = "confirm_deselect_not_checkin",
  confirm_available_items = "confirm_available_items",
  confirm_if_dirty = "confirm_if_dirty",
  confirm_logout = "confirm_logout",
  confirm_show_help = "confirm_show_help",
  dialog_regdesk_settings = "dialog_regdesk_settings",
  dialog_statistics = "dialog_statistics",
  dialog_theme = "dialog_theme",
  dialog_checkin = "dialog_checkin",
  regdesk = "regdesk",
  constoredesk = "constore",
  sponsordesk = "sponsordesk",
  shipping = "shipping",
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

var shortCutScopeStackRef: Ref<ShortcutScope[]> = ref([]);

function pushScope(scope: ShortcutScope): void {
  shortCutScopeStackRef.value.push(scope);
}

function popScope(scope: ShortcutScope): void {
  const checkScope: ShortcutScope | undefined =
    shortCutScopeStackRef.value.pop();
  if (scope != checkScope) {
    console.log(
      `Inconsistent scopes! ${scope}: ${shortCutScopeStackRef.value}`
    );
  }
}

function resetScope(scope: ShortcutScope): void {
  shortCutScopeStackRef.value = [];
}

function getCurrentScope(): ShortcutScope | undefined {
  return shortCutScopeStackRef.value[shortCutScopeStackRef.value.length - 1];
}

interface KeyboardService {
  registerShortcuts: typeof registerShortcuts;
  pushScope: typeof pushScope;
  popScope: typeof popScope;
  resetScope: typeof resetScope;
  getCurrentScope: typeof getCurrentScope;
}

export const keyboardService: KeyboardService = {
  registerShortcuts: registerShortcuts,
  pushScope: pushScope,
  popScope: popScope,
  resetScope: resetScope,
  getCurrentScope: getCurrentScope,
};

export function watchDialogVisibility(
  visiblityRef: Ref<boolean>,
  scope: ShortcutScope
): void {
  watch(
    () => visiblityRef.value,
    (value: boolean, oldValue: boolean | undefined) => {
      if (value) {
        pushScope(scope);
      } else if (oldValue !== undefined) {
        popScope(scope);
      }
    },
    { immediate: true }
  );
}
