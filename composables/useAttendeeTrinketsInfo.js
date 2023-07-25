import { ref, computed } from "vue";
import { useCSVList } from "@/composables/useCSVList";

import { configFlagsToItemsMap, configPackageToItemsMap, configTinketItems } from "@/ef.config";

import { concatenateListsForKey } from "@/composables/concatenateListsForKey";

export function useAttendeeTrinketsInfo(attendeeTrinketsApiDict, attendeeInfoApiDict) {
    const flagValueList = useCSVList(attendeeInfoApiDict, "flags");
    const packagesValueList = useCSVList(attendeeInfoApiDict, "packages");
    const ownedTrinketList = ref(
        computed({
            get: () => attendeeTrinketsApiDict.value?.issuedItems,
            set: (value) => {
                attendeeTrinketsApiDict.value.issuedItems = value.sort();
            },
        }),
    );
    const owedAndOwnedTrinketItemList = ref(
        computed({
            // Item dictionaries that the currently selected flags and packages allow - as well as currently selected items
            get: () => {
                if (attendeeInfoApiDict.value === null) {
                    return [];
                }
                const itemsForFlags = concatenateListsForKey(flagValueList.value, configFlagsToItemsMap);
                const itemsForPackages = concatenateListsForKey(packagesValueList.value, configPackageToItemsMap);
                const selectedItems = ownedTrinketList.value || [];
                const allShownItemList = [...new Set([...itemsForFlags, ...itemsForPackages, ...selectedItems])];
                return configTinketItems.filter((item) => allShownItemList.includes(item.value));
            },
        }),
    );
    return ref({
        ownedTrinketList: ownedTrinketList,
        owedAndOwnedTrinketItemList: owedAndOwnedTrinketItemList,
    });
}
