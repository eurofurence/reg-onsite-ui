import { getGoodieFromConcreteItem } from "@/composables/items/getGoodieFromConcreteItem";
import { getEmptyShippingAddInfo } from "@/composables/shipping/getEmptyShippingAddInfo";
import {
  type PlaceHolderTShirtType,
  type TShirtInfo,
  type TShirtTypeValue,
} from "@/config/metadata/tshirt/metadataForTShirtTypes";
import { TShirtType } from "@/config/metadata/tshirt/metadataForTShirtTypes";
import type { ApiShippingAddInfo } from "@/types/external/attsrv/additional-info/shipping";
import type { TransformedAttendeeInfo } from "@/types/internal/attendee";
import type { CountryCode } from "@/config/metadata/metadataForCountry";
import { getConventionSetup } from "@/composables/logic/getConventionSetup";
import type { ConcreteGoodieValue, GoodieConfig } from "@/config/convention";
import type { RegNumber } from "@/types/external/attsrv/attendees/attendee";

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
  let result = getEmptyShippingAddInfo();
  result.id = storedAttendeeInfo.id || (0 as RegNumber);
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
  getConventionSetup().metadata.forTShirtTypes.list.forEach(
    (item: TShirtInfo | PlaceHolderTShirtType) => {
      if (item.value === null) {
        return;
      }
      const tshirtItem: TShirtInfo = item as TShirtInfo;
      if (tshirtItem.value === tshirtType) {
        result.tshirt_shape = tshirtItem.shape;
        result.tshirt_size = tshirtItem.size;
      }
    }
  );
  return result;
}
