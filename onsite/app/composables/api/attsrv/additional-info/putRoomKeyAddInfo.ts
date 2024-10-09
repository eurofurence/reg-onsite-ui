import { type RestErrorHandler } from "@/composables/api/base/restErrorWrapper";
import type { ApiRoomKeyAddInfo } from "@/types/external/attsrv/additional-info/roomkey";
import { putAddInfo } from "@/composables/api/attsrv/additional-info/putGenericAddInfo";

export async function putRoomKeyAddInfo(
  errorHandler: RestErrorHandler,
  regNumber: number,
  itemData: ApiRoomKeyAddInfo
): Promise<null | undefined> {
  return await putAddInfo<ApiRoomKeyAddInfo>(
    "Attendee Key Service",
    "shipping", // FIXME!
    errorHandler,
    regNumber,
    itemData
  );
}
