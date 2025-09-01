import { getAllRegDeskAddInfos } from "@/composables/api/attsrv/additional-info/getAllRegDeskAddInfos";
import { getAllSponsorDeskAddInfos } from "@/composables/api/attsrv/additional-info/getAllSponsorDeskAddInfos";
import { getRegDeskDeskAddInfo } from "@/composables/api/attsrv/additional-info/getRegDeskDeskAddInfo";
import { getRoomKeyAddInfo } from "@/composables/api/attsrv/additional-info/getRoomKeyAddInfo";
import { getShippingAddInfo } from "@/composables/api/attsrv/additional-info/getShippingAddInfo";
import { getSponsorDeskAddInfo } from "@/composables/api/attsrv/additional-info/getSponsorDeskAddInfo";
import { putRegDeskDeskAddInfo } from "@/composables/api/attsrv/additional-info/putRegDeskDeskAddInfo";
import { putRoomKeyAddInfo } from "@/composables/api/attsrv/additional-info/putRoomKeyAddInfo";
import { putShippingAddInfo } from "@/composables/api/attsrv/additional-info/putShippingAddInfo";
import { putSponsorDeskAddInfo } from "@/composables/api/attsrv/additional-info/putSponsorDeskAddInfo";
import { getAttendeeStatusHistory } from "@/composables/api/attsrv/attendees/getAttendeeStatusHistory";
import { getOwnRegs } from "@/composables/api/attsrv/attendees/getOwnRegs";
import { putCashPaymentForAttendee } from "@/composables/api/attsrv/attendees/putCashPaymentForAttendee";
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
  putCashPaymentForAttendee: typeof putCashPaymentForAttendee;
  getAttendeeStatusHistory: typeof getAttendeeStatusHistory;
  debugSetStatusToPaid: typeof debugSetStatusToPaid;

  addInfos: {
    getAllSponsorDeskAddInfos: typeof getAllSponsorDeskAddInfos;
    getSponsorDeskAddInfo: typeof getSponsorDeskAddInfo;
    putSponsorDeskAddInfo: typeof putSponsorDeskAddInfo;

    getAllRegDeskAddInfos: typeof getAllRegDeskAddInfos;
    getRegDeskDeskAddInfo: typeof getRegDeskDeskAddInfo;
    putRegDeskDeskAddInfo: typeof putRegDeskDeskAddInfo;

    getShippingAddInfo: typeof getShippingAddInfo;
    putShippingAddInfo: typeof putShippingAddInfo;

    getRoomKeyAddInfo: typeof getRoomKeyAddInfo;
    putRoomKeyAddInfo: typeof putRoomKeyAddInfo;
  };
}

export const attendeeService: AttendeeService = {
  getOwnRegs: getOwnRegs,
  getAttendeeByRegNumber: getAttendeeByRegNumberTrans,
  getAttendees: getAttendeesTrans,
  getAllAttendees: getAllAttendeesTrans,
  checkinAttendee: checkinAttendee,
  putCashPaymentForAttendee: putCashPaymentForAttendee,
  getAttendeeStatusHistory: getAttendeeStatusHistory,
  debugSetStatusToPaid: debugSetStatusToPaid,

  addInfos: {
    getAllSponsorDeskAddInfos: getAllSponsorDeskAddInfos,
    getSponsorDeskAddInfo: getSponsorDeskAddInfo,
    putSponsorDeskAddInfo: putSponsorDeskAddInfo,

    getAllRegDeskAddInfos: getAllRegDeskAddInfos,
    getRegDeskDeskAddInfo: getRegDeskDeskAddInfo,
    putRegDeskDeskAddInfo: putRegDeskDeskAddInfo,

    getShippingAddInfo: getShippingAddInfo,
    putShippingAddInfo: putShippingAddInfo,

    getRoomKeyAddInfo: getRoomKeyAddInfo,
    putRoomKeyAddInfo: putRoomKeyAddInfo,
  },
};
