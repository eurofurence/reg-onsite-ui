import { getSubsetChoice } from "@/composables/collection_tools/getSubsetChoice";
import { getMainConRoleChoice } from "@/composables/fields/conrole/getMainConRoleChoice";
import { getCountryName } from "@/composables/fields/country/getCountryName";
import { getPackageChoice } from "@/composables/fields/packages/getPackageChoice";
import { canCheckin } from "@/composables/fields/status/canCheckin";
import {
  type ConBookValue,
  metadataListForConBookChoice,
} from "@/config/metadata/flags/metadataForConBookChoice";
import type {
  GoodiesLevelValue,
  SponsorLevelValue,
} from "@/config/metadata/packages/metadataForPerks";
import { metadataListForSponsorLevels } from "@/config/metadata/packages/metadataForSponsorLevels";
import { getAge } from "@/composables/fields/birthday/getAge";
import type { ApiAttendeeInfo } from "@/types/external/attsrv/attendees/attendee";
import type { TransformedAttendeeInfo } from "@/types/internal/attendee";
import { metadataListForGoodiesLevels } from "@/config/metadata/packages/metadataForGoodiesLevels";

function removeLeadingZerosFromDate(value: string): string {
  const dateComponents: number[] = value.split("-").map(Number);
  if (dateComponents.length !== 3) {
    throw new Error(`Invalid date encountered: ${value}`);
  }
  const [year, month, day] = <[number, number, number]>dateComponents;
  return `${year}-${month.toString()}-${day.toString()}`;
}

export function transformAttendee(
  attendee: ApiAttendeeInfo
): TransformedAttendeeInfo {
  const conbookChoice: ConBookValue =
    getSubsetChoice(attendee.flags_list, metadataListForConBookChoice) || "";
  const sponsorChoice: SponsorLevelValue = (getPackageChoice(
    attendee.packages_list,
    metadataListForSponsorLevels
  ) || "") as SponsorLevelValue;
  const goodieChoice: GoodiesLevelValue =
    getPackageChoice(attendee.packages_list, metadataListForGoodiesLevels) ||
    "";
  var transAttendee: TransformedAttendeeInfo = {
    ...{
      pronouns: attendee?.pronouns || null,
      tshirt_size: attendee?.tshirt_size || null,
      options_list: null,
      street: null,
      zip: null,
      city: null,
      email: null,
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
      transConbookChoice: conbookChoice,
      transSponsorChoice: sponsorChoice,
      transGoodieChoice: goodieChoice,
      transCanCheckin: canCheckin(attendee),
    },
  };
  return transAttendee;
}
