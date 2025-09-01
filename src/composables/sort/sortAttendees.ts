import { getAttendeeDummyFun } from "@/composables/sort_and_filter/getAttendeeDummyFun";
import { getFieldGetters } from "@/composables/sort_and_filter/getFieldGetters";
import type { TransformedAttendeeInfo } from "@/types/internal/attendee";
import type { ValueGetter } from "@/types/internal/sort";
import type { DataTableSortMeta } from "primevue/datatable";

interface ResolvedSortMeta<Type extends TransformedAttendeeInfo>
  extends DataTableSortMeta {
  get: ValueGetter<Type>;
}

function getPreparedSortSettings<Type extends TransformedAttendeeInfo>(
  sortSettingList: DataTableSortMeta[]
): ResolvedSortMeta<Type>[] {
  const fieldResolvers: {
    [key: string]: ValueGetter<Type>;
  } = getFieldGetters();
  return sortSettingList.map((sortSetting: DataTableSortMeta) => {
    // Function as field selector are unsupported
    const sortField: string = sortSetting.field as string;
    return {
      ...{ get: fieldResolvers[sortField] || getAttendeeDummyFun(sortField) },
      ...sortSetting,
    };
  });
}

export function sortAttendees<Type extends TransformedAttendeeInfo>(
  attendeeList: Type[],
  sortSettingList: DataTableSortMeta[]
): Type[] {
  const preparedSortSettings: ResolvedSortMeta<Type>[] =
    getPreparedSortSettings(sortSettingList);
  function compareBySortMeta(item1: Type, item2: Type): number {
    for (const sortSetting of preparedSortSettings) {
      if (!sortSetting.order || !sortSetting.field) {
        continue;
      }
      const fieldValue1: string | number = sortSetting.get(item1);
      const fieldValue2: string | number = sortSetting.get(item2);
      if (typeof fieldValue1 === "string" && typeof fieldValue2 === "string") {
        const cmpResult: number =
          fieldValue1.localeCompare(fieldValue2) * sortSetting.order;
        if (cmpResult !== 0) {
          return cmpResult;
        }
      } else {
        if (fieldValue1 > fieldValue2) {
          return sortSetting.order;
        } else if (fieldValue1 < fieldValue2) {
          return -sortSetting.order;
        }
      }
    }
    return 0;
  }
  return attendeeList.sort(compareBySortMeta);
}
