import { deepCopy } from "@/composables/deepCopy";
import type { ApiRegDeskAddInfo } from "@/types/external/attsrv/additional-info/regdesk";

const emptySponsorDeskAddInfo: ApiRegDeskAddInfo = {
  checkin_time: null,
  checkin_by: "",
  car_plate: "",
  has_room_key: false,
  badgePrintHistory: [],
};

export function getEmptyRegDeskAddInfo(): ApiRegDeskAddInfo {
  return deepCopy<ApiRegDeskAddInfo>(emptySponsorDeskAddInfo);
}
