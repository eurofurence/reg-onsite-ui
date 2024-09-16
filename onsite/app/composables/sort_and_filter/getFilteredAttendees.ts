import type {
  FilterFieldValue,
  RawAttendeeFilter,
  TransformedAttendeeInfo,
} from "@/types/internal";
import {
  getFilterFunctorContainerList,
  type FilterFunctorContainer,
} from "@/composables/sort_and_filter/getFilterFunctorContainerList";

export function getFilteredAttendees<Type extends TransformedAttendeeInfo>(
  unsortedList: Type[],
  filter: RawAttendeeFilter,
  globalFilterColumns: FilterFieldValue[]
): Type[] {
  const filterFunctorContainerList: FilterFunctorContainer<Type>[] =
    getFilterFunctorContainerList(filter, globalFilterColumns);
  const fieldFilterFunctorContainerList: FilterFunctorContainer<Type>[] =
    filterFunctorContainerList.filter(
      (ffc: FilterFunctorContainer<Type>) => !ffc.isFromGlobal
    );
  const globalFilterFunctorContainerList: FilterFunctorContainer<Type>[] =
    filterFunctorContainerList.filter(
      (ffc: FilterFunctorContainer<Type>) => ffc.isFromGlobal
    );

  if (
    globalFilterFunctorContainerList.length > 0 &&
    fieldFilterFunctorContainerList.length > 0
  ) {
    return unsortedList.filter(
      (attendee: Type) =>
        fieldFilterFunctorContainerList.every(
          (container: FilterFunctorContainer<Type>) =>
            container.matchFunction(attendee)
        ) &&
        globalFilterFunctorContainerList.some(
          (container: FilterFunctorContainer<Type>) =>
            container.matchFunction(attendee)
        )
    );
  } else if (fieldFilterFunctorContainerList.length > 0) {
    return unsortedList.filter((attendee: Type) =>
      fieldFilterFunctorContainerList.every(
        (container: FilterFunctorContainer<Type>) =>
          container.matchFunction(attendee)
      )
    );
  } else if (globalFilterFunctorContainerList.length > 0) {
    return unsortedList.filter((attendee: Type) =>
      globalFilterFunctorContainerList.some(
        (container: FilterFunctorContainer<Type>) =>
          container.matchFunction(attendee)
      )
    );
  } else {
    return [];
  }
}
