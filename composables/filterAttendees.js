import { FilterMatchMode, FilterService } from "primevue/api";

function getFilterValue(value) {
    try {
        return value.trim();
    } catch (error) {
        return value;
    }
}

function hasFilterContent(value) {
    if (value === null) {
        return false;
    }
    if (getFilterValue(value) === "") {
        return false;
    }
    return true;
}

export function isValidNameFilter(value) {
    if (!hasFilterContent(value)) {
        return false;
    }
    return value.length >= 2;
}

export function hasMinimalFilter(filterDict) {
    if (hasFilterContent(filterDict.badge_id.value)) {
        // Specific badge filters are always sufficient
        return true;
    }
    if (hasFilterContent(filterDict.global.value) && !isNaN(Number(filterDict.global.value))) {
        // A raw number in the global field is likely just a badge ID and therefore sufficient
        return true;
    }
    const minFilterFields = ["nickname", "first_name", "last_name", "birthday", "global"];
    // At least two characters in any of the specified filters are required to show the results
    for (const minFilterField of minFilterFields) {
        if (isValidNameFilter(filterDict[minFilterField].value)) {
            return true;
        }
    }
    return false;
}

export function removeLeadingZerosFromDate(value) {
    const [year, month, day] = value.split("-").map(Number);
    return `${year}-${month.toString()}-${day.toString()}`;
}

function filterRoles(filterMeta, dataFieldValue) {
    const filterValue = filterMeta.value;
    if ((filterValue?.length || 0) === 0) {
        return true; // handle empty filter
    } else if (filterValue.includes("") && dataFieldValue.length === 0) {
        return true;
    } else {
        return dataFieldValue.some((element) => filterValue.includes(element));
    }
}

function stripCharacterFromRight(inputString, character) {
    while (inputString.endsWith(character)) {
        inputString = inputString.slice(0, -1);
    }
    return inputString;
}

function parseDateElement(value, placeholder) {
    var doStop = false;
    if (value?.includes(placeholder)) {
        value = stripCharacterFromRight(value, placeholder);
        doStop = true;
    }
    const parsedValue = Number(value);
    if (isNaN(parsedValue) || parsedValue === 0) {
        return [doStop, null];
    }
    return [doStop, `${parsedValue}`];
}

export function getBirthdayFilterString(value) {
    const [year, month, day] = value.split("-");
    var result = null;

    const [yearStop, yearParsed] = parseDateElement(year, "y");
    if (yearParsed === null) {
        return result;
    }
    result = yearParsed;
    if (yearStop) {
        return result;
    }

    const [monthStop, monthParsed] = parseDateElement(month, "m");
    if (monthParsed === null) {
        return result;
    }
    result = result + `-${monthParsed}`;
    if (monthStop) {
        return result;
    }

    const [, dayParsed] = parseDateElement(day, "d");
    if (dayParsed === null) {
        return result;
    }
    result = result + `-${dayParsed}`;
    return result;
}

function filterBirthday(filterMeta, dataFieldValue) {
    if (filterMeta.value == null) {
        return true;
    }
    // Try simple filter
    if (defaultFilter(filterMeta, dataFieldValue)) {
        return true;
    }
    // Try filter with date parsing
    const birthdayFilter = getBirthdayFilterString(filterMeta.value);
    if (birthdayFilter === null) {
        return false;
    }
    const filterConstraint = FilterService.filters[filterMeta.matchMode];
    return filterConstraint(dataFieldValue, birthdayFilter);
}

function defaultFilter(filterMeta, dataFieldValue) {
    const filterValue = getFilterValue(filterMeta.value);
    const filterConstraint = FilterService.filters[filterMeta.matchMode];
    return filterConstraint(dataFieldValue, filterValue);
}

function filterBadgeId(filterMeta, item) {
    return defaultFilter(filterMeta, item.badge_id) || defaultFilter(filterMeta, item.id_str);
}

function filterCountry(filterMeta, item) {
    const filterValue = filterMeta.value || [];
    if (filterValue.length === 0) {
        return true;
    }
    return filterValue.includes(item.country) || filterValue.includes(item.country_name);
}

function filterColumn(item, filterField, filterMeta) {
    if (filterField === "badge_id") {
        return filterBadgeId(filterMeta, item);
    } else if (filterField === "country") {
        return filterCountry(filterMeta, item);
    } else if (filterField === "roles") {
        return filterRoles(filterMeta, item.roles);
    } else if (filterField === "birthday") {
        return filterBirthday(filterMeta, item.birthday_cleaned);
    } else if (filterField == "conbook") {
        return defaultFilter(filterMeta, item.conbook);
    } else if (filterField == "sponsor") {
        return defaultFilter(filterMeta, item.sponsor);
    } else {
        return defaultFilter(filterMeta, item[filterField]);
    }
}

function getEffectiveGlobalFilter(filterDict, globalFilterColumns) {
    if (globalFilterColumns === null || !hasFilterContent(filterDict.global.value)) {
        return [filterDict.global, []];
    }
    if (globalFilterColumns.includes("badge_id") && !isNaN(Number(filterDict.global.value))) {
        const newGlobalFilterMeta = {
            ...filterDict.global,
            ...{ matchMode: FilterMatchMode.EQUALS },
        };
        return [newGlobalFilterMeta, ["badge_id"]];
    }
    return [filterDict.global, globalFilterColumns];
}

function splitLastOccurrence(str, substring) {
    const lastIndex = str.lastIndexOf(substring);
    const before = str.slice(0, lastIndex);
    const after = str.slice(lastIndex + 1);
    return [before, after];
}

export function filterAttendees(array, filterDict, globalFilterColumns) {
    const [globalFilterMeta, appliedGlobalFilterColumns] = getEffectiveGlobalFilter(filterDict, globalFilterColumns);

    function filterAttendee(item) {
        let localMatch = true;
        for (const filterField in filterDict) {
            if (filterField !== "global") {
                localMatch = filterColumn(item, filterField, filterDict[filterField]);
                if (!localMatch) {
                    break;
                }
            }
        }
        if (appliedGlobalFilterColumns.length === 0) {
            return localMatch;
        }

        if (
            globalFilterMeta.value.indexOf(" ") >= 0 &&
            appliedGlobalFilterColumns.includes("first_name") &&
            appliedGlobalFilterColumns.includes("last_name")
        ) {
            const [globalFirstName, globalLastName] = splitLastOccurrence(globalFilterMeta.value.trim(), " ");
            const firstNameMatches = filterColumn(item, "first_name", {
                ...globalFilterMeta,
                value: globalFirstName,
            });
            const lastNameMatches = filterColumn(item, "last_name", {
                ...globalFilterMeta,
                value: globalLastName,
            });
            if (firstNameMatches && lastNameMatches) {
                return localMatch;
            }
        }

        for (const globalFilterField of appliedGlobalFilterColumns) {
            const globalMatch = filterColumn(item, globalFilterField, globalFilterMeta);
            if (globalMatch) {
                return localMatch;
            }
        }

        return false;
    }
    return array.filter(filterAttendee);
}
