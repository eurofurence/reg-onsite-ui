import type { DataTableFilterMetaData } from "primevue/datatable";
import type {
  FilterFieldValue,
  TransformedAttendeeInfo,
} from "@/types/internal";
import { getFilterDecisionForBadgeId } from "@/composables/sort_and_filter/old_approach/fields/getFilterDecisionForBadgeId";
import { getFilterDecisionForCountry } from "@/composables/sort_and_filter/old_approach/fields/getFilterDecisionForCountry";
import { getFilterDecisionForBirthday } from "@/composables/sort_and_filter/old_approach/fields/getFilterDecisionForBirthday";
import { getFilterDecisionForEnum } from "@/composables/sort_and_filter/old_approach/fields/getFilterDecisionForEnum";
import { getFilterDecisionForString } from "@/composables/sort_and_filter/old_approach/fields/getFilterDecisionForString";
import type { SponsorLevelValue } from "@/config/setupPackages";
import type { StatusValues } from "@/config/setupStatus";
import type { ConBookValue } from "@/config/setupConBookChoices";
import type { ConRoleValue } from "@/config/setupConRoles";

export function getFilterDecisionForColumn<
  Type extends TransformedAttendeeInfo
>(
  item: Type,
  filterField: FilterFieldValue,
  filterMeta: DataTableFilterMetaData
): boolean {
  if (filterField === "badge_id") {
    return getFilterDecisionForBadgeId(filterMeta, item);
  } else if (filterField === "country") {
    return getFilterDecisionForCountry(filterMeta, item);
  } else if (filterField === "birthday") {
    return getFilterDecisionForBirthday(filterMeta, item.transBirthday);
  } else if (filterField === "status") {
    return getFilterDecisionForEnum<StatusValues>(filterMeta, item.status);
  } else if (filterField == "transConbookChoice") {
    return getFilterDecisionForEnum<ConBookValue>(
      filterMeta,
      item.transConbookChoice
    );
  } else if (filterField == "transSponsorChoice") {
    return getFilterDecisionForEnum<SponsorLevelValue>(
      filterMeta,
      item.transSponsorChoice
    );
  } else if (filterField === "transConRole") {
    return getFilterDecisionForEnum<ConRoleValue>(
      filterMeta,
      item.transConRole
    );
  } else {
    return getFilterDecisionForString(filterMeta, item[filterField]);
  }
}
