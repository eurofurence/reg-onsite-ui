import { isDirty } from "@/composables/dirty/isDirty";
import type { ConfirmServiceMethods } from "@/types/external";

export function confirmIfDirty(
  confirm: ConfirmServiceMethods,
  groupName: string,
  call: CallableFunction
): void {
  if (isDirty.value) {
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
  } else {
    call();
  }
}
