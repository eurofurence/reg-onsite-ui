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
import { onMounted, watch, type Ref } from "vue";

function waitForNonEmptyList(
  transformedAttendeeListRef: Ref<TransformedAttendeeInfo[]>,
  timeoutDuration: number
): Promise<void> {
  if (transformedAttendeeListRef.value.length > 0) {
    return Promise.resolve();
  }
  return new Promise((resolve) => {
    const stopWatch = watch(
      () => transformedAttendeeListRef.value.length,
      (length) => {
        if (length > 0) {
          stopWatch();
          clearTimeout(timeoutHandle);
          resolve();
        }
      }
    );
    const timeoutHandle = setTimeout(() => {
      stopWatch();
      resolve();
    }, timeoutDuration);
  });
}

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
    const previousFilterValues = dataOptionsRef.value.filterConfig.filterValues;
    toastService.add(toastMessage);
    try {
      await waitForNonEmptyList(transformedAttendeeListRef, timeoutDuration);
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
    // Pre-filter the table to the restored attendee, but only once we know
    // the selection actually succeeded, and only if the user hasn't changed
    // the filter in the meantime (e.g. while data was still loading).
    if (dataOptionsRef.value.filterConfig.filterValues === previousFilterValues) {
      dataOptionsRef.value.filterConfig.filterValues = {
        ...getDefaultAttendeeFilterValues(),
        badge_id: { value: `${regNumber}`, matchMode: "startsWith" },
      };
    }
    toastService.add({
      severity: ToastSeverity.success,
      summary: `Restored previously selected registration #${regNumber}`,
      life: 2000,
    });
  }

  setupEventListener(window, "hashchange", tryRouteBasedSelection);
  onMounted(tryRouteBasedSelection);
}
