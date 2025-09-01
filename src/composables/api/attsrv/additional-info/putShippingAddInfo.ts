import { putAddInfo } from "@/composables/api/attsrv/additional-info/putGenericAddInfo";
import { type RestErrorHandler } from "@/composables/api/base/restErrorWrapper";
import type { ApiShippingAddInfo } from "@/types/external/attsrv/additional-info/shipping";
import type { RegNumber } from "@/types/external/attsrv/attendees/attendee";

export async function putShippingAddInfo(
  errorHandler: RestErrorHandler,
  regNumber: RegNumber,
  itemData: ApiShippingAddInfo
): Promise<null | undefined> {
  return await putAddInfo<ApiShippingAddInfo>(
    "Attendee Items Service",
    "shipping",
    errorHandler,
    regNumber,
    itemData
  );
}
