import CustomConfirmDialog from "@/components/dialog/CustomConfirmDialog.vue";
import { isDirty } from "@/composables/dirty/isDirty";
import { shallowRef, type ShallowRef } from "vue";

const customDialogRef: ShallowRef<typeof CustomConfirmDialog | null> =
  shallowRef<typeof CustomConfirmDialog | null>(null);

export function registerIsDirtyDialog(dialog: typeof CustomConfirmDialog) {
  customDialogRef.value = dialog;
}

export async function confirmIfDirty(call: CallableFunction): Promise<void> {
  if (isDirty.value && customDialogRef.value) {
    if (await customDialogRef.value.showConfirmDialogBlocking()) {
      call();
    }
  } else {
    call();
  }
}
