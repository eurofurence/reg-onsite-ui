import { deepCopy } from "@/composables/state/deepCopy";
import { TShirtShape } from "@/config/setupTShirtShapes";
import { TShirtSize } from "@/config/setupTShirtSizes";
import { type ApiShippingAddInfo, ShippingEmailUse } from "@/types/external";

const emptyShippingAddInfo: ApiShippingAddInfo = {
  id: 0,
  nickname: "",
  first_name: "",
  last_name: "",
  street: "",
  zip: "",
  city: "",
  email: "",
  country: "DE",
  state: "",
  comments: "",
  tshirt_size: TShirtSize.size_m,
  tshirt_shape: TShirtShape.regular,
  shipping_email: ShippingEmailUse.email_is_private,
};

export function getEmptyShippingAddInfo(): ApiShippingAddInfo {
  return deepCopy<ApiShippingAddInfo>(emptyShippingAddInfo);
}
