import { ref, watch } from "vue";
import { FilterMatchMode } from "primevue/api";
import { getCountryName } from "@/composables/fields/useCountry";
import { getSponsorItem } from "@/composables/fields/useSponsor";
import { getRoleItem } from "@/composables/fields/useRoles";
import { getStatusItem } from "@/composables/fields/useStatus";
import { configColumnItems } from "@/ef.config";

export function getActiveFilters(filters) {
    var activeFilters = [];
    for (const [, filterItem] of Object.entries(filters)) {
        if (filterItem.value !== null && filterItem.value !== "" && filterItem.value?.length !== 0) {
            activeFilters.push(filterItem);
        }
    }
    return activeFilters;
}

export function hasActiveFilter(filters) {
    return getActiveFilters(filters).length > 0;
}

const matchModeMap = {
    [FilterMatchMode.STARTS_WITH]: "starts with",
    [FilterMatchMode.CONTAINS]: "contains",
    [FilterMatchMode.NOT_CONTAINS]: "doesn't contain",
    [FilterMatchMode.ENDS_WITH]: "ends with",
    [FilterMatchMode.EQUALS]: "==",
    [FilterMatchMode.NOT_EQUALS]: "!=",
    [FilterMatchMode.IN]: "in",
    [FilterMatchMode.LESS_THAN]: "<",
    [FilterMatchMode.LESS_THAN_OR_EQUAL_TO]: "<=",
    [FilterMatchMode.GREATER_THAN]: ">",
    [FilterMatchMode.GREATER_THAN_OR_EQUAL_TO]: ">=",
    [FilterMatchMode.BETWEEN]: "between",
    [FilterMatchMode.DATE_IS]: "date is",
    [FilterMatchMode.DATE_IS_NOT]: "date isn't",
    [FilterMatchMode.DATE_BEFORE]: "date before",
    [FilterMatchMode.DATE_AFTER]: "date after",
};

function getMaxLength(array) {
    return array.reduce((max, str) => {
        return Math.max(max, str.length);
    }, 0);
}

export function getFilterText(filters) {
    const activeFilters = getActiveFilters(filters);
    const maxLengthLabel = getMaxLength(activeFilters.map((item) => item.label)) + 3;
    const maxMatchMode = getMaxLength(activeFilters.map((item) => matchModeMap[item.matchMode]));

    function getFilterText(item) {
        const itemLabel = item.label.padStart(maxLengthLabel);
        const matchLabel = matchModeMap[item.matchMode].padEnd(maxMatchMode);
        var itemValue = item.value;
        if (item.column === "country") {
            itemValue = item.value.map(getCountryName).slice(0, 5);
            if (item.value.length > 5) {
                itemValue = `${itemValue}... (${item.value.length} countries)`;
            }
        } else if (item.column === "sponsor") {
            itemValue = item.value.map((value) => getSponsorItem(value).label);
        } else if (item.column === "roles") {
            itemValue = item.value.map((value) => getRoleItem(value).label);
        } else if (item.column === "status") {
            itemValue = item.value.map((value) => getStatusItem(value).label);
        }
        return `${itemLabel} ${matchLabel} "${itemValue}"`;
    }
    var result = activeFilters.map(getFilterText);
    return result.join("\n");
}

export function canResetFilter(filtersRef, storedFilterValues) {
    for (const [filterKey, filterItem] of Object.entries(filtersRef)) {
        if (!Object.keys(storedFilterValues).includes(filterKey)) {
            if (filterItem.value !== null) {
                return true;
            }
        }
    }
    return false;
}

export function resetFilters(filtersRef, storedFilterValues) {
    for (const [filterKey, filterItem] of Object.entries(filtersRef)) {
        if (!Object.keys(storedFilterValues).includes(filterKey)) {
            filterItem.value = null;
        }
    }
}

export function useFilter(storedFilterValues) {
    const result = ref({
        global: {
            value: null,
            label: "Global",
            matchMode: FilterMatchMode.CONTAINS,
        },
    });
    configColumnItems.forEach((item) => {
        result.value[item.column] = {
            value: null,
            matchMode: item.matchMode,
            label: item.label,
            column: item.column,
        };
    });
    for (const item in storedFilterValues) {
        result.value[item].value = storedFilterValues[item];
        watch(
            () => result.value[item].value,
            (newValue) => {
                storedFilterValues[item] = newValue;
            },
        );
    }
    return result;
}
