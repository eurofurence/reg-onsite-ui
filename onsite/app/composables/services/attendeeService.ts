import { getAllSponsorDeskAddInfos } from "@/composables/api/attsrv/additional-info/getAllSponsorDeskAddInfos";
import { getAttendeeStatusHistory } from "@/composables/api/attsrv/attendees/getAttendeeStatusHistory";
import { getOwnRegs } from "@/composables/api/attsrv/attendees/getOwnRegs";
import { getShippingAddInfo } from "@/composables/api/attsrv/additional-info/getShippingAddInfo";
import { getSponsorDeskAddInfo } from "@/composables/api/attsrv/additional-info/getSponsorDeskAddInfo";
import { putShippingAddInfo } from "@/composables/api/attsrv/additional-info/putShippingAddInfo";
import { putSponsorDeskAddInfo } from "@/composables/api/attsrv/additional-info/putSponsorDeskAddInfo";
import { checkinAttendee } from "@/composables/services/attendee/checkinAttendee";
import { debugSetStatusToPaid } from "@/composables/services/attendee/debugSetStatusToPaid";
import { getAllAttendeesTrans } from "@/composables/services/attendee/getAllAttendeesTrans";
import { getAttendeeByRegNumberTrans } from "@/composables/services/attendee/getAttendeeByRegNumberTrans";
import { getAttendeesTrans } from "@/composables/services/attendee/getAttendeesTrans";
import { getRoomKeyAddInfo } from "@/composables/api/attsrv/additional-info/getRoomKeyAddInfo";
import { putRoomKeyAddInfo } from "@/composables/api/attsrv/additional-info/putRoomKeyAddInfo";

interface AttendeeService {
  getOwnRegs: typeof getOwnRegs;
  getAttendeeByRegNumber: typeof getAttendeeByRegNumberTrans;
  getAttendees: typeof getAttendeesTrans;
  getAllAttendees: typeof getAllAttendeesTrans;
  checkinAttendee: typeof checkinAttendee;
  getAttendeeStatusHistory: typeof getAttendeeStatusHistory;
  debugSetStatusToPaid: typeof debugSetStatusToPaid;

  addInfos: {
    getAllSponsorDeskAddInfos: typeof getAllSponsorDeskAddInfos;
    getSponsorDeskAddInfo: typeof getSponsorDeskAddInfo;
    putSponsorDeskAddInfo: typeof putSponsorDeskAddInfo;

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
  getAttendeeStatusHistory: getAttendeeStatusHistory,
  debugSetStatusToPaid: debugSetStatusToPaid,

  addInfos: {
    getAllSponsorDeskAddInfos: getAllSponsorDeskAddInfos,
    getSponsorDeskAddInfo: getSponsorDeskAddInfo,
    putSponsorDeskAddInfo: putSponsorDeskAddInfo,

    getShippingAddInfo: getShippingAddInfo,
    putShippingAddInfo: putShippingAddInfo,

    getRoomKeyAddInfo: getRoomKeyAddInfo,
    putRoomKeyAddInfo: putRoomKeyAddInfo,
  },
};
