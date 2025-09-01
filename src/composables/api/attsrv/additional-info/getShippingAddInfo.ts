import { getAddInfo } from "@/composables/api/attsrv/additional-info/getGenericAddInfo";
import { type RestErrorHandler } from "@/composables/api/base/restErrorWrapper";
import type { ApiShippingAddInfo } from "@/types/external/attsrv/additional-info/shipping";
import type { RegNumber } from "@/types/external/attsrv/attendees/attendee";

export async function getShippingAddInfo(
  errorHandler: RestErrorHandler,
  regNumber: RegNumber
): Promise<ApiShippingAddInfo | null | undefined> {
  return await getAddInfo<ApiShippingAddInfo>(
    "Attendee Shipping Service",
    "shipping",
    errorHandler,
    regNumber
  );
}
