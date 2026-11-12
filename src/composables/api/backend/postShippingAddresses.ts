import { fetchResultWrapper } from "@/composables/api/base/fetchResultWrapper";
import { postApi } from "@/composables/api/base/postApi";
import {
  type RestErrorHandler,
  restErrorWrapper,
} from "@/composables/api/base/restErrorWrapper";
import type { CountryCode } from "@/config/metadata/metadataForCountry";
import type { RegNumber } from "@/types/external/attsrv/attendees/attendee";
import type { ApiError } from "@/types/external/error";
import type { FetchResultPromise } from "@/types/internal/rest";

export interface ShippingAddress {
  id: RegNumber;
  nickname: string;
  first_name: string;
  last_name: string;
  street: string;
  zip: string;
  city: string;
  country: CountryCode | "";
  state: string;
  email: string;
  comments: string;
  tshirt_size: string;
  tshirt_shape: string;
  shipping_email: string;
}

interface ShippingAddressesResponse {
  addresses: ShippingAddress[];
}

async function fetchShippingAddresses(
  attendeeIds: RegNumber[]
): FetchResultPromise<ShippingAddressesResponse, ApiError> {
  const response = await postApi("onsite/api/v1/shipping/addresses", {
    attendee_ids: attendeeIds,
  });
  return fetchResultWrapper<ShippingAddressesResponse>(response);
}

export async function postShippingAddresses(
  errorHandler: RestErrorHandler,
  attendeeIds: RegNumber[]
): Promise<ShippingAddress[] | undefined> {
  const result = await restErrorWrapper<ShippingAddressesResponse>(
    "Backend Service",
    () => fetchShippingAddresses(attendeeIds),
    errorHandler
  );
  return result?.addresses;
}
