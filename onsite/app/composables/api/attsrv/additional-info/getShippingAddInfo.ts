import { type RestErrorHandler } from "@/composables/api/base/restErrorWrapper";
import type { ApiShippingAddInfo } from "@/types/external/attsrv/additional-info/shipping";
import { getAddInfo } from "@/composables/api/attsrv/additional-info/getGenericAddInfo";

export async function getShippingAddInfo(
  errorHandler: RestErrorHandler,
  regNumber: number
): Promise<ApiShippingAddInfo | null | undefined> {
  return await getAddInfo<ApiShippingAddInfo>(
    "Attendee Shipping Service",
    "shipping",
    errorHandler,
    regNumber
  );
}
