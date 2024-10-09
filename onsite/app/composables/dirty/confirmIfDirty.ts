import { isDirty } from "@/composables/dirty/isDirty";
import { ShortcutScope } from "@/composables/services/keyboardService";
import type { OnsiteConfirmService } from "@/composables/services/confirmService";

export function confirmIfDirty(
  confirmService: OnsiteConfirmService,
  call: CallableFunction
): void {
  if (isDirty.value) {
    confirmService.require(ShortcutScope.confirm_if_dirty, {
      message: "There are unsaved changes! Are you sure you want to proceed?",
      header: "Confirmation",
      icon: "pi pi-exclamation-triangle",
      accept: () => {
        call();
      },
      reject: () => {},
    });
  } else {
    call();
  }
}
