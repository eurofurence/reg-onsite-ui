import TShirtShape from "@/components/common/field/TShirtShape.vue";
import { deepCopy } from "@/composables/deepCopy";
import type { CountryCode } from "@/config/metadata/metadataForCountry";
import { TShirtSize } from "@/config/metadata/tshirt/metadataForTShirtSizes";
import {
  ShippingEmailUse,
  type ApiShippingAddInfo,
} from "@/types/external/attsrv/additional-info/shipping";
import type { RegNumber } from "@/types/external/attsrv/attendees/attendee";

const emptyShippingAddInfo: ApiShippingAddInfo = {
  id: 0 as RegNumber,
  nickname: "",
  first_name: "",
  last_name: "",
  street: "",
  zip: "",
  city: "",
  email: "",
  country: "DE" as CountryCode,
  state: "",
  comments: "",
  tshirt_size: TShirtSize.size_m,
  tshirt_shape: TShirtShape.regular,
  shipping_email: ShippingEmailUse.email_is_private,
};

export function getEmptyShippingAddInfo(): ApiShippingAddInfo {
  return deepCopy<ApiShippingAddInfo>(emptyShippingAddInfo);
}
