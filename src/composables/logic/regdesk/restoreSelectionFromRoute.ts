import { setupEventListener } from "@/composables/events/setupEventListener";
import { getRegNumberFromRoute } from "@/composables/route/getRegNumberFromRoute";
import { setRegNumberRoute } from "@/composables/route/setRegNumberRoute";
import type { OnsiteToastService } from "@/composables/services/toastService";
import { getDefaultAttendeeFilterValues } from "@/config/system/regdesk";
import type { RegNumber } from "@/types/external/attsrv/attendees/attendee";
import type { TransformedAttendeeInfo } from "@/types/internal/attendee";
import { ToastSeverity } from "@/types/internal/primevue";
import type { AttendeeDataOptions } from "@/types/internal/system/regdesk";
import type { ToastMessageOptions } from "primevue";
import { onMounted, ref, type Ref } from "vue";

const waitForAttendeeList: Ref<boolean> = ref(true);

export function restoreSelectionFromRoute(
  toastService: OnsiteToastService,
  dataOptionsRef: Ref<AttendeeDataOptions>,
  transformedAttendeeListRef: Ref<TransformedAttendeeInfo[]>,
  selectedAttendeeRef: Ref<TransformedAttendeeInfo | null>
) {
  async function tryRouteBasedSelection(): Promise<void> {
    const regNumber: RegNumber | null = getRegNumberFromRoute();
    const isAlreadySelected: boolean =
      selectedAttendeeRef.value?.id === regNumber;
    if (regNumber === null || isAlreadySelected) {
      return;
    }
    const timeoutDuration: number = 5000;
    const toastMessage: ToastMessageOptions = {
      severity: ToastSeverity.info,
      summary: `Opening previously selected registration #${regNumber}`,
      life: timeoutDuration,
    };
    dataOptionsRef.value.filterConfig.filterValues = {
      ...getDefaultAttendeeFilterValues(),
      ...{
        badge_id: { value: `${regNumber}`, matchMode: "startsWith" },
      },
    };
    toastService.add(toastMessage);
    setTimeout(() => {
      waitForAttendeeList.value = false;
    }, timeoutDuration);
    try {
      while (
        transformedAttendeeListRef.value.length === 0 &&
        waitForAttendeeList.value === true
      ) {
        await new Promise((resolve) => setTimeout(resolve, 50));
      }
    } finally {
      toastService.remove(toastMessage);
    }
    if (transformedAttendeeListRef.value.length === 0) {
      toastService.add({
        severity: ToastSeverity.error,
        summary: `Unable to retrieve data for selecting registration #${regNumber}.`,
        life: 5000,
      });
      return;
    }

    const matchingAttendee: TransformedAttendeeInfo[] =
      transformedAttendeeListRef.value.filter((transformedAttendee) => {
        return transformedAttendee.id == regNumber;
      });

    if (matchingAttendee.length !== 1) {
      setRegNumberRoute(null);
      return;
    }
    selectedAttendeeRef.value = matchingAttendee[0] as TransformedAttendeeInfo;
    toastService.add({
      severity: ToastSeverity.success,
      summary: `Restored previously selected registration #${regNumber}`,
      life: 2000,
    });
  }

  setupEventListener(window, "hashchange", tryRouteBasedSelection);
  onMounted(tryRouteBasedSelection);
}
