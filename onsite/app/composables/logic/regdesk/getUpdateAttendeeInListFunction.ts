import type { ToastServiceMethods } from "primevue/toastservice";
import { handleSingleAttendeeSearch } from "@/composables/search_status/handleSingleAttendeeSearch";
import type { SearchStatus, TransformedAttendeeInfo } from "@/types/internal";

function hasAttendeeChanged(
  regNumber: number,
  oldValue: TransformedAttendeeInfo | null,
  newValue: TransformedAttendeeInfo
) {
  return (
    oldValue?.id === regNumber &&
    JSON.stringify(oldValue) !== JSON.stringify(newValue)
  );
}

export function getUpdateAttendeeInListFunction(
  listRef: Ref<TransformedAttendeeInfo[]>,
  selectedRef: Ref<TransformedAttendeeInfo | null>,
  searchStatusRef: Ref<SearchStatus>,
  toast: ToastServiceMethods,
  toastGroup: string
): (regNumber: number) => Promise<TransformedAttendeeInfo | null> {
  return async (regNumber: number): Promise<TransformedAttendeeInfo | null> => {
    const result: TransformedAttendeeInfo | null =
      await handleSingleAttendeeSearch(
        regNumber,
        searchStatusRef,
        toast,
        toastGroup
      );
    if (result == null) {
      return null;
    }
    if (hasAttendeeChanged(regNumber, selectedRef.value, result)) {
      selectedRef.value = result;
    }
    listRef.value.forEach(
      (attendee: TransformedAttendeeInfo, index: number) => {
        // Prevent unnecessary reactive updates
        if (hasAttendeeChanged(regNumber, attendee, result)) {
          listRef.value[index] = attendee;
        }
      }
    );
    return result;
  };
}
