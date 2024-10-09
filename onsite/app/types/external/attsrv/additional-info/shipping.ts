import type { CountryCode } from "@/config/metadata/metadataForCountry";
import type { TShirtShapeValue } from "@/config/metadata/tshirt/metadataForTShirtShapes";
import type { TShirtSizeValue } from "@/config/metadata/tshirt/metadataForTShirtSizes";

export const enum ShippingEmailUse {
  email_can_be_shared_with_logistics = "status",
  email_is_private = "none",
}

export type ShippingEmailUseValue = `${ShippingEmailUse}`;

export interface ApiShippingAddInfo {
  id: number;
  nickname: string;
  first_name: string;
  last_name: string;
  street: string;
  zip: string;
  city: string;
  email: string;
  country: CountryCode;
  state: string;
  comments: string;
  tshirt_size: TShirtSizeValue;
  tshirt_shape: TShirtShapeValue;
  shipping_email: ShippingEmailUseValue;
}
