import { FilterMatchMode } from "primevue/api";
import { getAttendees } from "@/composables/apiAttendeeSearch";
import { isValidNameSearch, getBirthdayFilterString } from "@/composables/filterAttendees";
import { configConbookItems, configRegdeskSponsorItems, configRoleItems } from "@/ef.config";
import { convertListToMap } from "@/composables/convertListToMap";
import { configCountryItems } from "@/composables/fields/useCountry.js";

async function getAttendeesPageForQuery(globalState, toast, filterQuery, sortOrderQuery, min_id, num_results) {
    const pageQuery = {
        min_id: min_id,
        max_id: 99999,
        num_results: num_results,
    };
    const apiPayload = {
        ...pageQuery,
        ...sortOrderQuery,
        ...{ match_any: filterQuery },
    };
    return await getAttendees(globalState, toast, apiPayload);
}

async function getAllAttendeesForQuery(globalState, toast, filterQuery, sortOrderQuery) {
    return (await getAttendeesPageForQuery(globalState, toast, filterQuery, sortOrderQuery, 0, 10000)) || [];
}

export async function getAllAttendeesForFilter(globalState, toast, filterDict, globalSearchColumns, sortOrder) {
    return await getAllAttendeesForQuery(globalState, toast, transformFilterToQuery(filterDict, globalSearchColumns), transformSortOrder(sortOrder));
}

export async function getAllAttendees(globalState, toast) {
    return await getAllAttendeesForQuery(globalState, toast, [{ nickname: "*" }]);
}

function transformSortOrder(sortOrder) {
    function mapOrder(order) {
        if (order === 1) {
            return "ascending";
        }
        return "descending";
    }
    for (const order of sortOrder) {
        if (["badge_id"].includes(order.field)) {
            return { sort_by: "id", sort_order: mapOrder(order.order) };
        }
        if (["first_name"].includes(order.field)) {
            return { sort_by: "name", sort_order: mapOrder(order.order) };
        }
        if (["status", "nickname", "birthday", "country"].includes(order.field)) {
            return { sort_by: order.field, sort_order: mapOrder(order.order) };
        }
    }
    return {};
}

function getMatchString(filterMeta) {
    if (filterMeta.matchMode === FilterMatchMode.CONTAINS) {
        return `*${filterMeta.value}*`;
    } else if (filterMeta.matchMode === FilterMatchMode.STARTS_WITH) {
        return `${filterMeta.value}*`;
    } else if (filterMeta.matchMode === FilterMatchMode.ENDS_WITH) {
        return `*${filterMeta.value}`;
    } else if (filterMeta.matchMode === FilterMatchMode.EQUALS) {
        return `${filterMeta.value}`;
    }
}

export function getBirthdayFrom(value) {
    const parsed = getBirthdayFilterString(value);
    if (parsed === null) {
        return "1900-01-01";
    }
    const [year, month, day] = parsed.split("-");
    return `${year.padEnd(4, "0")}-${(month || "1").padStart(2, "0")}-${(day || "1").padStart(2, "0")}`;
}

function daysInMonth(year, month) {
    return new Date(year, month, 0).getDate();
}

export function getBirthdayTo(value) {
    const parsed = getBirthdayFilterString(value);
    if (parsed === null) {
        return "2100-01-01";
    }
    const [year, month, day] = parsed.split("-");
    const yearResult = year.padEnd(4, "9");
    const monthResult = (month || "12").padStart(2, "0");
    const defaultDays = daysInMonth(Number(yearResult), Number(monthResult)).toString();
    const dayResult = (day || defaultDays).padStart(2, "0");
    return `${yearResult}-${monthResult}-${dayResult}`;
}

function getID(value) {
    const onlyNumber = value.replace(/\D/g, "");
    if (onlyNumber === "") {
        return NaN;
    }
    return Number(onlyNumber);
}

export function getBaseFilterElement(filterDict) {
    var result = {};
    if (filterDict.first_name.value !== null && filterDict.last_name.value !== null) {
        result.name = getMatchString(filterDict.first_name) + " " + getMatchString(filterDict.last_name);
    }
    for (const key in filterDict) {
        const filterMeta = filterDict[key];
        const filterValue = filterMeta.value;
        if (filterValue === null || filterValue === "") {
            continue;
        }
        if (key === "badge_id") {
            result.ids = (result?.ids || []).concat([getID(filterValue)]);
        } else if (key === "nickname") {
            result.nickname = getMatchString(filterMeta);
        } else if (key === "first_name" && filterDict.last_name.value === null) {
            result.name = getMatchString(filterMeta) + " *";
        } else if (key === "last_name" && filterDict.first_name.value === null) {
            result.name = "* " + getMatchString(filterMeta);
        } else if (key === "status") {
            if (filterMeta.value?.length > 0) {
                result.status = filterMeta.value;
            }
        } else if (key === "birthday") {
            result.birthday_from = getBirthdayFrom(filterValue);
            result.birthday_to = getBirthdayTo(filterValue);
        }
    }
    return result;
}

function cartesianProduct(arrays) {
    if (arrays.length === 0) {
        return [[]];
    }
    const [currentArray, ...remainingArrays] = arrays;
    const subCartesian = cartesianProduct(remainingArrays);
    const result = [];
    for (const value of currentArray) {
        for (const sub of subCartesian) {
            result.push([value, ...sub]);
        }
    }
    return result;
}

const conbookMap = convertListToMap(configConbookItems);
const rolesMap = convertListToMap(configRoleItems);
const sponsorMap = convertListToMap(configRegdeskSponsorItems);

function isValidGlobalDateSearch(filterValue) {
    var isDateSearch = false;
    const dateRegexYYYYMMDD = /^(19|20|21)\d{2}-(0?[1-9]|1[0-2])-(0?[1-9]|[12]\d|3[01])$/;
    isDateSearch = isDateSearch || filterValue.match(dateRegexYYYYMMDD);
    const dateRegexYYYYMM = /^(19|20|21)\d{2}-(0?[1-9]|1[0-2])-?$/;
    isDateSearch = isDateSearch || filterValue.match(dateRegexYYYYMM);
    const dateRegexYYYY = /^(19|20|21)\d{2}-?$/;
    isDateSearch = isDateSearch || filterValue.match(dateRegexYYYY);
    return isDateSearch;
}

export function getGlobalFilters(filterMeta, globalSearchColumns) {
    var enabledGlobalSearchColumns = globalSearchColumns || [];
    const filterValue = filterMeta.value;
    if (filterValue === null || filterValue === "") {
        return [];
    }
    var result = [];
    if (enabledGlobalSearchColumns.includes("nickname")) {
        if (isValidNameSearch(filterMeta.value) && isNaN(Number(filterMeta.value))) {
            result.push({ nickname: getMatchString(filterMeta) });
        }
    }
    if (enabledGlobalSearchColumns.includes("first_name") || enabledGlobalSearchColumns.includes("last_name")) {
        if (isValidNameSearch(filterMeta.value) && isNaN(Number(filterMeta.value))) {
            result.push({ name: getMatchString(filterMeta) });
        }
    }
    if (enabledGlobalSearchColumns.includes("birthday")) {
        if (isValidGlobalDateSearch(filterValue)) {
            result.push({
                birthday_from: getBirthdayFrom(filterValue),
                birthday_to: getBirthdayTo(filterValue),
            });
        }
    }
    const idCandidate = getID(filterValue);
    if (enabledGlobalSearchColumns.includes("badge_id") && !isNaN(idCandidate)) {
        result.push({ ids: [idCandidate] });
    }
    return result;
}

function getProductLikeFilters(filterDict, globalSearchColumns) {
    var result = [];
    for (const key in filterDict) {
        if (key === "global") {
            const globalFilters = getGlobalFilters(filterDict.global, globalSearchColumns);
            if (globalFilters.length > 0) {
                result.push(globalFilters);
            }
            continue;
        }
        const filterValues = filterDict[key].value;
        if (filterValues === null || filterValues.length === 0) {
            continue;
        }
        if (key === "country") {
            if (configCountryItems.length !== filterValues.length && filterValues.length < 10) {
                result.push(
                    filterValues.map((filterValue) => ({
                        country: filterValue,
                    })),
                );
            }
        } else if (key === "conbook") {
            if (configConbookItems.length !== filterValues.length) {
                result.push(filterValues.map((filterValue) => conbookMap[filterValue].search));
            }
        } else if (key === "roles") {
            if (configRoleItems.length !== filterValues.length) {
                result.push(filterValues.map((filterValue) => rolesMap[filterValue].search));
            }
        } else if (key === "sponsor") {
            if (configRegdeskSponsorItems.length !== filterValues.length) {
                result.push(filterValues.map((filterValue) => sponsorMap[filterValue].search));
            }
        }
    }
    return result;
}

function combineFilters(filterList) {
    return filterList.reduce((merged, current) => {
        return { ...merged, ...current };
    }, {});
}

export function transformFilterToQuery(filterDict, globalSearchColumns) {
    const baseFilterElement = getBaseFilterElement(filterDict);
    const productLikeFilters = getProductLikeFilters(filterDict, globalSearchColumns);
    const filterVariants = cartesianProduct([[baseFilterElement]].concat(productLikeFilters));
    return filterVariants.map(combineFilters);
}
