import { useToast } from "primevue";
import type { ToastMessageOptions } from "primevue/toast";
import type { ToastServiceMethods } from "primevue/toastservice";

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
    this.toastService.add({
      ...this.defaultToastMessage,
      ...message,
    });
  }

  remove(message: ToastMessageOptions) {
    this.toastService.remove({
      ...this.defaultToastMessage,
      ...message,
    });
  }
}
