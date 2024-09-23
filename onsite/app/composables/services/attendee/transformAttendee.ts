import { getSubsetChoice } from "@/composables/collection_tools/getSubsetChoice";
import { getAllRoleValues } from "@/composables/fields/conrole/getAllRoleValues";
import { getConRoleChoice } from "@/composables/fields/conrole/getConRoleChoice";
import { getCountryName } from "@/composables/fields/country/getCountryName";
import { getPackageChoice } from "@/composables/fields/packages/getPackageChoice";
import { canCheckin } from "@/composables/fields/status/canCheckin";
import {
  type ConBookValue,
  setupConBookChoices,
} from "@/config/flags/setupConBookChoices";
import { setupGoodiesLevels } from "@/config/setupGoodiesLevels";
import type {
  GoodiesLevelValue,
  SponsorLevelValue,
} from "@/config/packages/setupPackages";
import type { ConRoleValue } from "@/config/setupConRoles";
import { setupSponsorLevels } from "@/config/packages/setupSponsorLevels";
import type { ApiAttendeeInfo } from "@/types/external";
import type { TransformedAttendeeInfo } from "@/types/internal";
import { getAge } from "@/composables/fields/birthday/getAge";

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
  const allRoles: ConRoleValue[] = getAllRoleValues(
    attendee.flags_list,
    attendee.id
  );
  const conbookChoice: ConBookValue =
    getSubsetChoice(attendee.flags_list, setupConBookChoices) || "";
  const sponsorChoice: SponsorLevelValue =
    <SponsorLevelValue>(
      getPackageChoice(attendee.packages_list, setupSponsorLevels)
    ) || "";
  const goodiesChoice: GoodiesLevelValue =
    getPackageChoice(attendee.packages_list, setupGoodiesLevels) || "";
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
      transConRole: getConRoleChoice(attendee.flags_list, attendee.id).value,
      transFullName: `${attendee.first_name} ${attendee.last_name}`,
      transConRoleList: allRoles,
      transConRoleListStr: allRoles.join("|"),
      transCountryName: getCountryName(attendee.country),
      transConbookChoice: conbookChoice,
      transSponsorChoice: sponsorChoice,
      transGoodieChoice: goodiesChoice,
      transCanCheckin: canCheckin(attendee),
    },
  };
  return transAttendee;
}
