import type { DataTableFilterMetaData } from "primevue/datatable";
import type { TransformedAttendeeInfo } from "@/types/internal";
import { getFilterDecisionForString } from "@/composables/sort_and_filter/old_approach/fields/getFilterDecisionForString";

export function getFilterDecisionForBadgeId<
  Type extends TransformedAttendeeInfo
>(filterMeta: DataTableFilterMetaData, item: Type): boolean {
  return (
    getFilterDecisionForString(filterMeta, item.badge_id) ||
    getFilterDecisionForString(filterMeta, item.transId)
  );
}
