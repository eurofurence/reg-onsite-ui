import { getTrinketFromConcreteItem } from "@/composables/items/getTrinketFromConcreteItem";
import { getEmptyShippingAddInfo } from "@/composables/shipping/getEmptyShippingAddInfo";
import {
  type TShirtInfo,
  type TShirtTypeValue,
  setupTShirtTypesInternal,
} from "@/config/setupTShirtTypes";
import { TShirtType } from "@/config/setupTShirtTypes";
import type { ConcreteTrinketValue, TrinketConfig } from "@/setupEFIteration";
import type { ApiShippingAddInfo } from "@/types/external";
import type { TransformedAttendeeInfo } from "@/types/internal";

function getTShirtTypeFromMissingItems(
  missingItems: ConcreteTrinketValue[]
): TShirtTypeValue | undefined {
  const missingTShirtValue: ConcreteTrinketValue | undefined =
    missingItems.find((item: ConcreteTrinketValue) =>
      item.startsWith("tshirt_")
    );
  if (!missingTShirtValue) {
    return;
  }
  const trinket: TrinketConfig | null =
    getTrinketFromConcreteItem(missingTShirtValue);
  if (!trinket) {
    return;
  }
}

export function getPrefilledShippingInfo<Type extends TransformedAttendeeInfo>(
  storedAttendeeInfo: Type,
  missingItems: ConcreteTrinketValue[]
): ApiShippingAddInfo {
  var result = getEmptyShippingAddInfo();
  result.id = storedAttendeeInfo.id || 0;
  result.nickname = storedAttendeeInfo.nickname || "";
  result.first_name = storedAttendeeInfo.first_name || "";
  result.last_name = storedAttendeeInfo.last_name || "";
  result.street = storedAttendeeInfo.street || "";
  result.zip = storedAttendeeInfo.zip || "";
  result.email = storedAttendeeInfo.email || "";
  result.city = storedAttendeeInfo.city || "";
  result.country = storedAttendeeInfo.country || "";
  result.state = storedAttendeeInfo.state || "";

  const tshirtType: TShirtTypeValue =
    getTShirtTypeFromMissingItems(missingItems) ||
    storedAttendeeInfo?.tshirt_size ||
    TShirtType.regular_m;
  setupTShirtTypesInternal.forEach((item: TShirtInfo) => {
    if (item.value === tshirtType) {
      result.tshirt_shape = item.shape;
      result.tshirt_size = item.size;
    }
  });
  return result;
}
