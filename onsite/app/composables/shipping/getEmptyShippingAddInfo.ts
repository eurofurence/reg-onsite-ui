import { TShirtSize } from "@/config/metadata/tshirt/metadataForTShirtSizes";
import TShirtShape from "@/components/field/TShirtShape.vue";
import type { CountryCode } from "@/config/metadata/metadataForCountry";
import {
  ShippingEmailUse,
  type ApiShippingAddInfo,
} from "@/types/external/attsrv/additional-info/shipping";
import { deepCopy } from "@/composables/deepCopy";

const emptyShippingAddInfo: ApiShippingAddInfo = {
  id: 0,
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
