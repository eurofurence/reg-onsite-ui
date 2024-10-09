import type { ConfirmationOptions } from "primevue/confirmationoptions";
import {
  keyboardService,
  ShortcutScope,
} from "@/composables/services/keyboardService";

interface ConfirmServiceMethods {
  require: (option: ConfirmationOptions) => void;
  close: () => void;
}

export class OnsiteConfirmService {
  confirmService: ConfirmServiceMethods;
  confirmGroup: string;

  constructor(componentId: string) {
    this.confirmService = useConfirm();
    this.confirmGroup = `confirm${componentId}`;
  }

  require(scope: ShortcutScope, option: ConfirmationOptions) {
    keyboardService.pushScope(scope);
    const defaultConfirmOption: ConfirmationOptions = {
      group: this.confirmGroup,
    };
    this.confirmService.require({
      ...defaultConfirmOption,
      ...option,
    });
    keyboardService.popScope(scope);
  }
}
