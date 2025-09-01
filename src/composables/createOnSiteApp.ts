import { initTheme } from "@/composables/theme/initTheme";
import "@/pages/assets/style.css";
import PrimeVue from "primevue/config";
import ConfirmationService from "primevue/confirmationservice";
import StyleClass from "primevue/styleclass";
import ToastService from "primevue/toastservice";
import Tooltip from "primevue/tooltip";
import { createApp, type Component } from "vue";

export function createOnSiteApp(rootComponent: Component): void {
  const app = createApp(rootComponent);
  app.use(PrimeVue, {
    unstyled: true,
    pt: {
      directives: {
        tooltip: {
          root: {
            class: `hidden w-fit pointer-events-none absolute max-w-48 group drop-shadow-lg animate-fade-in
                                data-[p-position=top]:py-1 data-[p-position=bottom]:py-1
                                data-[p-position=left]:px-1 data-[p-position=right]:px-1
                        `,
          },
          arrow: {
            class: `absolute w-0 h-0 border-transparent border-solid border-[.25rem]
                                group-data-[p-position=top]:border-y-surface-700 group-data-[p-position=top]:-ml-1 group-data-[p-position=top]:border-b-0
                                group-data-[p-position=bottom]:border-y-surface-700 group-data-[p-position=bottom]:-ml-1 group-data-[p-position=bottom]:border-t-0
                                group-data-[p-position=left]:border-l-surface-700 group-data-[p-position=left]:-mt-1 group-data-[p-position=left]:border-r-0
                                group-data-[p-position=right]:border-r-surface-700 group-data-[p-position=right]:-mt-1 group-data-[p-position=right]:border-l-0
                        `,
          },
          text: {
            class:
              "break-words whitespace-pre-line bg-surface-700 text-surface-0 px-3 py-2 rounded",
          },
        },
      },
    },
  });
  app.use(ToastService);
  app.use(ConfirmationService);
  app.directive("styleclass", StyleClass);
  app.directive("tooltip", Tooltip);
  app.mount("#app");
  initTheme();
}
