import { getCountryName } from "@/composables/fields/country/getCountryName";
import { getSubsetChoice } from "@/composables/collection_tools/getSubsetChoice";
import { getMainConRoleChoice } from "@/composables/fields/conrole/getMainConRoleChoice";
import { getPackageChoice } from "@/composables/fields/packages/getPackageChoice";
import { getAttendeeDummyFun } from "@/composables/sort_and_filter/getAttendeeDummyFun";
import type { TransformedAttendeeInfo } from "@/types/internal/attendee";
import type { ValueGetter } from "@/types/internal/sort";
import type { CountryCode } from "@/config/metadata/metadataForCountry";
import { getConventionSetup } from "@/composables/logic/getConventionSetup";

function getAttendeeCountry<Type extends TransformedAttendeeInfo>(
  attendee: Type
): string {
  return (
    attendee.transCountryName ||
    getCountryName(attendee.country || ("" as CountryCode))
  );
}

function getAttendeeConbook<Type extends TransformedAttendeeInfo>(
  attendee: Type
): string {
  return (
    attendee.transConbookChoice ||
    getSubsetChoice(
      attendee.flags_list || [],
      getConventionSetup().metadata.forConBook.list
    ) ||
    ""
  );
}

function getAttendeeConRole<Type extends TransformedAttendeeInfo>(
  attendee: Type
): string {
  return (
    attendee.transConRole ||
    getMainConRoleChoice(attendee.flags_list, attendee.id).value
  );
}

function getAttendeeSponsor<Type extends TransformedAttendeeInfo>(
  attendee: Type
): string {
  return (
    getPackageChoice(
      attendee.packages_list || [],
      getConventionSetup().metadata.forSponsorLevels.list
    ) || ""
  );
}

function getAttendeeGoodies<Type extends TransformedAttendeeInfo>(
  attendee: Type
): string {
  return (
    getPackageChoice(
      attendee.packages_list || [],
      getConventionSetup().metadata.forGoodiesLevels.list
    ) || ""
  );
}

type AllowedFieldsWithType<Obj, Type> = {
  [K in keyof Obj]: Obj[K] extends Type ? K : never;
};

function getAttendeeStringFun<Type extends TransformedAttendeeInfo>(
  fieldName: keyof AllowedFieldsWithType<Type, string>
): ValueGetter<Type> {
  return (attendee: Type) => attendee[fieldName] as string;
}

function getAttendeeNumberFun<Type extends TransformedAttendeeInfo>(
  fieldName: keyof AllowedFieldsWithType<Type, string>
): ValueGetter<Type> {
  return (attendee: Type) => Number(attendee[fieldName]) || 0;
}

function getAttendeeBooleanFun<Type extends TransformedAttendeeInfo>(
  fieldName: keyof AllowedFieldsWithType<Type, string>
): ValueGetter<Type> {
  return (attendee: Type) => Number(attendee[fieldName]) || 0;
}

export function getFieldGetters(): Record<
  keyof TransformedAttendeeInfo,
  ValueGetter<TransformedAttendeeInfo>
> {
  return {
    id: getAttendeeNumberFun("id"),
    transId: getAttendeeStringFun("transId"),
    badge_id: getAttendeeStringFun("badge_id"),
    transAge: getAttendeeNumberFun("transAge"),
    country: getAttendeeCountry,
    transCountryName: getAttendeeCountry,
    transCanCheckin: getAttendeeBooleanFun("transCanCheckin"),
    transConbookChoice: getAttendeeConbook,
    transGoodieChoice: getAttendeeGoodies,
    transConRole: getAttendeeConRole,
    transSponsorChoice: getAttendeeSponsor,
    transBirthday: getAttendeeStringFun("birthday"),
    nickname: getAttendeeStringFun("nickname"),
    first_name: getAttendeeStringFun("first_name"),
    last_name: getAttendeeStringFun("last_name"),
    transFullName: getAttendeeStringFun("transFullName"),
    birthday: getAttendeeStringFun("birthday"),
    pronouns: getAttendeeStringFun("pronouns"),
    tshirt_size: getAttendeeStringFun("tshirt_size"),
    spoken_languages_list: getAttendeeDummyFun("spoken_languages_list"),
    registration_language: getAttendeeStringFun("registration_language"),
    flags_list: getAttendeeDummyFun("flags_list"),
    options_list: getAttendeeDummyFun("options_list"),
    packages_list: getAttendeeDummyFun("packages_list"),
    status: getAttendeeStringFun("status"),
    total_dues: getAttendeeNumberFun("total_dues"),
    payment_balance: getAttendeeNumberFun("payment_balance"),
    current_dues: getAttendeeNumberFun("current_dues"),
    street: getAttendeeStringFun("street"),
    zip: getAttendeeStringFun("zip"),
    city: getAttendeeStringFun("city"),
    email: getAttendeeStringFun("email"),
    state: getAttendeeStringFun("state"),
  };
}
