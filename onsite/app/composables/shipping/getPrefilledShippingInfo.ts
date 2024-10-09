import { getGoodieFromConcreteItem } from "@/composables/items/getGoodieFromConcreteItem";
import { getEmptyShippingAddInfo } from "@/composables/shipping/getEmptyShippingAddInfo";
import {
  type TShirtInfo,
  type TShirtTypeValue,
  metadataListForTShirtTypesInternal,
} from "@/config/metadata/tshirt/metadataForTShirtTypes";
import { TShirtType } from "@/config/metadata/tshirt/metadataForTShirtTypes";
import type { ConcreteGoodieValue, GoodieConfig } from "@/setupEFIteration";
import type { ApiShippingAddInfo } from "@/types/external/attsrv/additional-info/shipping";
import type { TransformedAttendeeInfo } from "@/types/internal/attendee";
import type { CountryCode } from "@/config/metadata/metadataForCountry";

function getTShirtTypeFromMissingItems(
  missingItems: ConcreteGoodieValue[]
): TShirtTypeValue | undefined {
  const missingTShirtValue: ConcreteGoodieValue | undefined = missingItems.find(
    (item: ConcreteGoodieValue) => item.startsWith("tshirt_")
  );
  if (!missingTShirtValue) {
    return;
  }
  const goodie: GoodieConfig | null =
    getGoodieFromConcreteItem(missingTShirtValue);
  if (!goodie) {
    return;
  }
}

export function getPrefilledShippingInfo<Type extends TransformedAttendeeInfo>(
  storedAttendeeInfo: Type,
  missingItems: ConcreteGoodieValue[]
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
  result.country = (storedAttendeeInfo.country || "") as CountryCode;
  result.state = storedAttendeeInfo.state || "";

  const tshirtType: TShirtTypeValue =
    getTShirtTypeFromMissingItems(missingItems) ||
    storedAttendeeInfo?.tshirt_size ||
    TShirtType.regular_m;
  metadataListForTShirtTypesInternal.forEach((item: TShirtInfo) => {
    if (item.value === tshirtType) {
      result.tshirt_shape = item.shape;
      result.tshirt_size = item.size;
    }
  });
  return result;
}
