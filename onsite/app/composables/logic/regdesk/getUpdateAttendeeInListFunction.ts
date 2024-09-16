import type { ToastServiceMethods } from "primevue/toastservice";
import { handleSingleAttendeeSearch } from "@/composables/search_status/handleSingleAttendeeSearch";
import type { SearchStatus, TransformedAttendeeInfo } from "@/types/internal";

export function getUpdateAttendeeInListFunction(
  listRef: Ref<TransformedAttendeeInfo[]>,
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
    listRef.value.forEach(
      (attendee: TransformedAttendeeInfo, index: number) => {
        // Prevent unnecessary reactive updates
        if (
          attendee.id === result.id &&
          JSON.stringify(attendee) !== JSON.stringify(result)
        ) {
          listRef.value[index] = attendee;
        }
      }
    );
    return result;
  };
}
