import { deepCopy } from "@/composables/deepCopy";
import type { TransformedAttendeeInfo } from "@/types/internal/attendee";

const placeholderAttendeeInfo: TransformedAttendeeInfo = {
  id: null,
  status: null,
  badge_id: null,
  nickname: null,
  pronouns: null,
  first_name: null,
  last_name: null,
  country: null,
  birthday: null,
  tshirt_size: null,
  spoken_languages_list: null,
  registration_language: null,
  flags_list: null,
  options_list: null,
  packages_list: null,
  total_dues: null,
  payment_balance: null,
  current_dues: null,
  transBirthday: null,
  transCanCheckin: null,
  transConbookChoice: null,
  transConRole: null,
  transCountryName: null,
  transGoodieChoice: null,
  transFullName: null,
  transAge: null,
  city: null,
  street: null,
  phone: null,
  telegram: null,
  identity_subject: null,
  gender: null,
  user_comments: null,
  partner: null,
  avatar: null,
  email: null,
  state: null,
  zip: null,
  transId: null,
  transSponsorChoice: null,
};

export function getPlaceholderAttendeeInfo<
  Type extends TransformedAttendeeInfo
>(): Type {
  return deepCopy<Type>(placeholderAttendeeInfo as Type);
}
