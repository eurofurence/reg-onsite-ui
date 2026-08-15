import { getRecordedConcreteItems } from "@/composables/items/getRecordedConcreteItems";
import { getMissingConcreteItems } from "@/composables/items/getMissingConcreteItems";
import type { ConcreteGoodieValue } from "@/config/convention";
import type { ApiSponsorDeskAddInfo } from "@/types/external/attsrv/additional-info/sponsordesk";
import type { TransformedAttendeeInfo } from "@/types/internal/attendee";

// Everything the attendee is entitled to based on their packages/flags/reg-number,
// whether or not it has actually been issued/reserved/given to them yet.
export function getConcreteItemsEntitlement(
  attendee: TransformedAttendeeInfo,
  apiSponsorDeskAddInfo: ApiSponsorDeskAddInfo
): ConcreteGoodieValue[] {
  const missingConcreteItems = getMissingConcreteItems(attendee, apiSponsorDeskAddInfo);
  const recordedConcreteItems = getRecordedConcreteItems(apiSponsorDeskAddInfo);
  return missingConcreteItems.concat(recordedConcreteItems);
}
