import { getCountryName } from "@/composables/fields/useCountry";
import { getRoles } from "@/composables/fields/useRoles";
import { getConbook } from "@/composables/fields/useConbook";
import { getSponsor } from "@/composables/fields/useSponsor";

function getSortField(item, field) {
    if (field == "id") {
        return item?.id_number || Number(item[field]);
    } else if (field == "badge_id") {
        return item?.id_number || Number(item.id);
    } else if (field == "country") {
        return item?.country_name || getCountryName(item[field]);
    } else if (field == "conbook") {
        return item?.conbook || getConbook(item);
    } else if (field == "roles") {
        return item?.roles || getRoles(item);
    } else if (field == "sponsor") {
        return item?.sponsor || getSponsor(item);
    }
    return item[field].toLowerCase();
}

export function sortAttendees(array, sortMeta) {
    function compareBySortMeta(item1, item2) {
        for (const entryIdx in sortMeta) {
            const entry = sortMeta[entryIdx];
            if (getSortField(item1, entry.field) > getSortField(item2, entry.field)) {
                return -entry.order;
            } else if (getSortField(item1, entry.field) < getSortField(item2, entry.field)) {
                return entry.order;
            }
        }
        return 0;
    }
    return array.value.sort(compareBySortMeta);
}
