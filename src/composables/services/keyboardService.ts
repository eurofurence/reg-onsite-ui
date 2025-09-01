import { setupKeyEvents } from "@/composables/events/setupKeyEvents";
import type { KeyMatchFunction } from "@/types/internal/keyboard";
import { ref, watch, type Ref } from "vue";

export const enum ShortcutScope {
  no_scope = "no_scope",
  shielded = "shielded",
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

export interface KeyboardServiceEvent {
  registeredScope: ShortcutScope;
  currentScope: ShortcutScope;
  event: KeyboardEvent;
}

export type KeyboardServiceCallback = (
  event: KeyboardServiceEvent
) => Promise<boolean>;

export interface StoredKeyboardServiceCallback {
  registeredScope: ShortcutScope;
  handler: KeyboardServiceCallback;
}

const shortcutHandlers = new Map<string, StoredKeyboardServiceCallback[]>();

function getShortcutLookupKey(
  event: ShortcutEvent,
  triggerKey: ShortcutKey,
  withModifier: boolean
): string {
  return `${event}_${triggerKey}_${withModifier ? "mod" : "nomod"}`;
}

function registerShortcuts(
  scope: ShortcutScope,
  event: ShortcutEvent,
  triggerKey: ShortcutKey,
  handler: KeyboardServiceCallback,
  withModifier = false
): void {
  const matchFunction: KeyMatchFunction | undefined =
    keyMatchMap.get(triggerKey);
  if (matchFunction === undefined) {
    throw new Error(`Please check trigger key ${triggerKey}!`);
  }
  const lookupKey = getShortcutLookupKey(event, triggerKey, withModifier);
  if (!shortcutHandlers.has(lookupKey)) {
    shortcutHandlers.set(lookupKey, []);

    // Register a central dispatcher only once per shortcut key
    async function triggerOnKeyEvent(
      keyboardEvent: KeyboardEvent //
    ): Promise<any> {
      const hasDisableShortcuts =
        document.activeElement?.closest("[data-disable-shortcuts]") !== null;
      if (hasDisableShortcuts) return;

      const storedHandlerList: StoredKeyboardServiceCallback[] | undefined =
        shortcutHandlers.get(lookupKey);
      if (!storedHandlerList) return;

      const currentScope: ShortcutScope =
        keyboardService.getCurrentScope() || ShortcutScope.no_scope;
      // Sequentially await each handler
      for (const storedHandlerInfo of storedHandlerList) {
        const keyboardServiceEvent: KeyboardServiceEvent = {
          registeredScope: storedHandlerInfo.registeredScope,
          currentScope: currentScope,
          event: keyboardEvent,
        };
        const isHandled: boolean = await storedHandlerInfo.handler(
          keyboardServiceEvent
        );
        if (isHandled) {
          // handler did it's job - so no default action necessary
          keyboardEvent.preventDefault();
          break;
        }
      }
    }
    setupKeyEvents(event, matchFunction, triggerOnKeyEvent, withModifier);
  }
  shortcutHandlers.get(lookupKey)!.push({
    handler: handler,
    registeredScope: scope,
  });
}

let shortCutScopeStackRef: Ref<ShortcutScope[]> = ref([]);

function pushScope(scope: ShortcutScope): void {
  shortCutScopeStackRef.value.push(scope);
}

function popScope(scope: ShortcutScope): void {
  const checkScope: ShortcutScope | undefined =
    shortCutScopeStackRef.value.pop();
  if (scope != checkScope) {
    console.error(
      `Inconsistent scopes! ${scope}: ${shortCutScopeStackRef.value}`
    );
  }
}

function resetScope(_scope: ShortcutScope): void {
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
