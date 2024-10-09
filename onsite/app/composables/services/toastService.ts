import type { ToastMessageOptions } from "primevue/toast";
import type { ToastServiceMethods } from "primevue/toastservice";

export class OnsiteToastService {
  toastService: ToastServiceMethods;
  toastGroup: string;

  constructor(componentId: string) {
    this.toastService = useToast();
    this.toastGroup = `toast${componentId}`;
  }

  add(message: ToastMessageOptions) {
    const defaultToastMessage: ToastMessageOptions = {
      group: this.toastGroup,
    };
    this.toastService.add({
      ...defaultToastMessage,
      ...message,
    });
  }
}
