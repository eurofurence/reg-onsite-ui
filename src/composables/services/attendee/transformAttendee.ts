import { getAge } from "@/composables/fields/birthday/getAge";
import { getMainConRoleChoice } from "@/composables/fields/conrole/getMainConRoleChoice";
import { getCountryName } from "@/composables/fields/country/getCountryName";
import { getConBookValue } from "@/composables/fields/flags/getValues";
import {
  getGoodieValue,
  getSponsorValue,
} from "@/composables/fields/packages/getValues";
import { canCheckin } from "@/composables/fields/status/canCheckin";
import type {
  ApiAttendeeInfo,
  IsoBirthdayStr,
} from "@/types/external/attsrv/attendees/attendee";
import type {
  TransformedAttendeeInfo,
  TrimmedBirthdayStr,
} from "@/types/internal/attendee";

function removeLeadingZerosFromDate(value: IsoBirthdayStr): TrimmedBirthdayStr {
  const dateComponents: number[] = value.split("-").map(Number);
  if (dateComponents.length !== 3) {
    throw new Error(`Invalid date encountered: ${value}`);
  }
  const [year, month, day] = <[number, number, number]>dateComponents;
  return `${year}-${month.toString()}-${day.toString()}` as TrimmedBirthdayStr;
}

export function transformAttendee(
  attendee: ApiAttendeeInfo
): TransformedAttendeeInfo {
  let transAttendee: TransformedAttendeeInfo = {
    ...{
      badge_id: null,
      avatar: null,
      identity_subject: null,
      pronouns: null,
      tshirt_size: null,
      options_list: null,
      street: null,
      zip: null,
      city: null,
      gender: null,
      user_comments: null,
      telegram: null,
      partner: null,
      email: null,
      phone: null,
      state: null,
    },
    ...attendee,
    ...{
      transId: `${attendee.id}`,
      transAge: getAge(attendee.birthday),
      transBirthday: removeLeadingZerosFromDate(attendee.birthday),
      transConRole: getMainConRoleChoice(attendee.flags_list, attendee.id)
        .value,
      transFullName: `${attendee.first_name} ${attendee.last_name}`,
      transCountryName: getCountryName(attendee.country),
      transConbookChoice: getConBookValue(attendee.flags_list),
      transSponsorChoice: getSponsorValue(attendee.packages_list),
      transGoodieChoice: getGoodieValue(attendee.packages_list),
      transCanCheckin: canCheckin(attendee),
    },
  };
  return transAttendee;
}
