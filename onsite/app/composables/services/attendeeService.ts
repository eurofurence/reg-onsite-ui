import { getAllSponsorDeskAddInfos } from "@/composables/api/getAllSponsorDeskAddInfos";
import { getAttendeeStatusHistory } from "@/composables/api/getAttendeeStatusHistory";
import { getOwnRegs } from "@/composables/api/getOwnRegs";
import { getShippingAddInfo } from "@/composables/api/getShippingAddInfo";
import { getSponsorDeskAddInfo } from "@/composables/api/getSponsorDeskAddInfo";
import { putShippingAddInfo } from "@/composables/api/putShippingAddInfo";
import { putSponsorDeskAddInfo } from "@/composables/api/putSponsorDeskAddInfo";
import { checkinAttendee } from "@/composables/services/attendee/checkinAttendee";
import { debugSetStatusToPaid } from "@/composables/services/attendee/debugSetStatusToPaid";
import { getAllAttendeesTrans } from "@/composables/services/attendee/getAllAttendeesTrans";
import { getAttendeeByRegNumberTrans } from "@/composables/services/attendee/getAttendeeByRegNumberTrans";
import { getAttendeesTrans } from "@/composables/services/attendee/getAttendeesTrans";

interface AttendeeService {
  getOwnRegs: typeof getOwnRegs;
  getAttendeeByRegNumber: typeof getAttendeeByRegNumberTrans;
  getAttendees: typeof getAttendeesTrans;
  getAllAttendees: typeof getAllAttendeesTrans;
  checkinAttendee: typeof checkinAttendee;
  getAttendeeStatusHistory: typeof getAttendeeStatusHistory;
  debugSetStatusToPaid: typeof debugSetStatusToPaid;

  getAllSponsorDeskAddInfos: typeof getAllSponsorDeskAddInfos;
  getSponsorDeskAddInfo: typeof getSponsorDeskAddInfo;
  putSponsorDeskAddInfo: typeof putSponsorDeskAddInfo;

  getShippingAddInfo: typeof getShippingAddInfo;
  putShippingAddInfo: typeof putShippingAddInfo;
}

export const attendeeService: AttendeeService = {
  getOwnRegs: getOwnRegs,
  getAttendeeByRegNumber: getAttendeeByRegNumberTrans,
  getAttendees: getAttendeesTrans,
  getAllAttendees: getAllAttendeesTrans,
  checkinAttendee: checkinAttendee,
  getAttendeeStatusHistory: getAttendeeStatusHistory,
  debugSetStatusToPaid: debugSetStatusToPaid,

  getAllSponsorDeskAddInfos: getAllSponsorDeskAddInfos,
  getSponsorDeskAddInfo: getSponsorDeskAddInfo,
  putSponsorDeskAddInfo: putSponsorDeskAddInfo,
  getShippingAddInfo: getShippingAddInfo,
  putShippingAddInfo: putShippingAddInfo,
};
