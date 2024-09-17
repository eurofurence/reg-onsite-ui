import { isDirty } from "@/composables/dirty/isDirty";
import type { ConfirmServiceMethods } from "@/types/external";
import { keyboardService, ShortcutScope } from "@/composables/services/keyboardService";

export function confirmIfDirty(
  confirm: ConfirmServiceMethods,
  groupName: string,
  call: CallableFunction
): void {
  if (isDirty.value) {
    keyboardService.pushScope(ShortcutScope.confirm_if_dirty);
    confirm.require({
      group: groupName,
      message: "There are unsaved changes! Are you sure you want to proceed?",
      header: "Confirmation",
      icon: "pi pi-exclamation-triangle",
      accept: () => {
        call();
      },
      reject: () => {},
    });
    keyboardService.popScope(ShortcutScope.confirm_if_dirty);
  } else {
    call();
  }
}
