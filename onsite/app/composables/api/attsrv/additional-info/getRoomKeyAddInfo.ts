import { type RestErrorHandler } from "@/composables/api/base/restErrorWrapper";
import { getAddInfo } from "@/composables/api/attsrv/additional-info/getGenericAddInfo";
import type { ApiRoomKeyAddInfo } from "@/types/external/attsrv/additional-info/roomkey";

export async function getRoomKeyAddInfo(
  errorHandler: RestErrorHandler,
  regNumber: number
): Promise<ApiRoomKeyAddInfo | null | undefined> {
  return await getAddInfo<ApiRoomKeyAddInfo>(
    "Attendee Key Service",
    "shipping", // FIXME!
    errorHandler,
    regNumber
  );
}
