import { getAddInfo } from "@/composables/api/attsrv/additional-info/getGenericAddInfo";
import { type RestErrorHandler } from "@/composables/api/base/restErrorWrapper";
import type { ApiRoomKeyAddInfo } from "@/types/external/attsrv/additional-info/roomkey";
import type { RegNumber } from "@/types/external/attsrv/attendees/attendee";

export async function getRoomKeyAddInfo(
  errorHandler: RestErrorHandler,
  regNumber: RegNumber
): Promise<ApiRoomKeyAddInfo | null | undefined> {
  return await getAddInfo<ApiRoomKeyAddInfo>(
    "Attendee Key Service",
    "shipping", // FIXME!
    errorHandler,
    regNumber
  );
}
