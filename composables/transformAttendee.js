import { getRoles } from "@/composables/fields/useRoles";
import { getConbook } from "@/composables/fields/useConbook";
import { getSponsor } from "@/composables/fields/useSponsor";
import { getCountryName } from "@/composables/fields/useCountry";
import { removeLeadingZerosFromDate } from "@/composables/filterAttendees";

export function transformAttendee(item, sponsorItems = null) {
    item.id_str = `${item.id}`;
    item.id_number = Number(item.id);
    item.birthday_cleaned = removeLeadingZerosFromDate(item.birthday);
    item.country_name = getCountryName(item.country);
    item.conbook = getConbook(item);
    item.sponsor = getSponsor(item, sponsorItems);
    item.roles = getRoles(item);
    return item;
}
