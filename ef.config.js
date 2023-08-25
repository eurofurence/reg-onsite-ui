import { FilterMatchMode } from "primevue/api";

export const configConStartDate = new Date("2023-09-03");

export const configAdminGroups = ["OE7QZN2RQX9KWML4", "54ZYODX1G2K1M76N"];

export const configDDGroups = ["QE3VMR2LK9X1PW07", "EN3GL42Q072JKZQO"];

export const configColumnItems = [
    {
        column: "badge_id",
        label: "Badge ID",
        matchMode: FilterMatchMode.EQUALS,
        isGlobal: true,
    },
    {
        column: "nickname",
        label: "Nickname",
        matchMode: FilterMatchMode.CONTAINS,
        isGlobal: true,
    },
    {
        column: "first_name",
        label: "First Name",
        matchMode: FilterMatchMode.CONTAINS,
        isGlobal: true,
    },
    {
        column: "last_name",
        label: "Last Name",
        matchMode: FilterMatchMode.CONTAINS,
        isGlobal: true,
    },
    {
        column: "country",
        label: "Country",
        matchMode: FilterMatchMode.IN,
    },
    {
        column: "birthday",
        label: "Birthday",
        matchMode: FilterMatchMode.CONTAINS,
        isGlobal: true,
    },
    {
        column: "status",
        label: "Status",
        matchMode: FilterMatchMode.IN,
    },
    {
        column: "conbook",
        label: "Conbook",
        matchMode: FilterMatchMode.IN,
    },
    {
        column: "sponsor",
        label: "Sponsor",
        matchMode: FilterMatchMode.IN,
    },
    {
        column: "roles",
        label: "Roles",
        matchMode: FilterMatchMode.CONTAINS,
    },
    {
        column: "current_dues",
        label: "Dues",
        matchMode: FilterMatchMode.EQUALS,
    },
];

export const possibleGlobalSearchColumns = configColumnItems.filter((item) => item.isGlobal);

export const configSearchCookie = {
    activeColumns: ["badge_id", "nickname", "first_name", "last_name", "birthday", "status", "sponsor", "conbook", "roles", "checkin", "dues"],
    globalSearchColumns: possibleGlobalSearchColumns.map((item) => item.column),
    filterDisplay: "menu",
    displayRowsPerPage: 10,
    displayType: "dialog",
    queryMode: "preload",
    autoSelect: true,
};

export const configThemeCookie = {
    isDarkMode: false,
    fontSize: 14,
    headerSize: 1,
};

export const configSortOrderCookie = {
    sortOrder: [],
};

export const configFilterCookie = {
    status: ["approved", "partially paid", "paid"],
    roles: null,
    sponsor: null,
};

export const configTShirtItems = [
    {
        value: null,
        label: "Not Specified",
    },
    {
        value: "XS",
        label: "X-Small (Regular)",
    },
    {
        value: "wXS",
        label: "X-Small (Contoured)",
    },
    {
        value: "S",
        label: "Small (Regular)",
    },
    {
        value: "wS",
        label: "Small (Contoured)",
    },
    {
        value: "M",
        label: "Medium (Regular)",
    },
    {
        value: "wM",
        label: "Medium (Contoured)",
    },
    {
        value: "L",
        label: "Large (Regular)",
    },
    {
        value: "wL",
        label: "Large (Contoured)",
    },
    {
        value: "XL",
        label: "X-Large (Regular)",
    },
    {
        value: "wXL",
        label: "X-Large (Contoured)",
    },
    {
        value: "XXL",
        label: "XX-Large (Regular)",
    },
    {
        value: "wXXL",
        label: "XX-Large (Contoured)",
    },
    {
        value: "3XL",
        label: "3X-Large (Regular)",
    },
    {
        value: "w3XL",
        label: "3X-Large (Contoured)",
    },
    {
        value: "4XL",
        label: "4X-Large (Regular)",
    },
    {
        value: "w4XL",
        label: "4X-Large (Contoured)",
    },
];

export const configConbookItems = [
    {
        value: "",
        label: "Physical",
        color: "primary-400",
        search: { flags: { "digi-book": 0 } },
    },
    {
        value: "digi-book",
        label: "Digital",
        color: "primary-500",
        search: { flags: { "digi-book": 1 } },
    },
];

export const configDealerItems = [
    {
        value: "",
        label: "No Dealer",
    },
    {
        value: "dealer-half",
        label: "DD Half",
    },
    {
        value: "dealer-full",
        label: "DD Full",
    },
    {
        value: "dealer-double",
        label: "DD Double",
    },
    {
        value: "dealer-quad",
        label: "DD Quad",
    },
];

export const configDayAttendanceItems = [
    {
        value: "day-sun",
        label: "Sun (Sep-03)",
    },
    {
        value: "day-mon",
        label: "Mon (Sep-04)",
    },
    {
        value: "day-tue",
        label: "Tue (Sep-05)",
    },
    {
        value: "day-wed",
        label: "Wed (Sep-06)",
    },
];

export const configOtherItems = [
    {
        value: "artshow-panel",
        label: "Art Show Panel",
    },
    {
        value: "artshow-table",
        label: "Art Show Table",
    },
    {
        value: "boat-benefactor",
        label: "Boat Benefactor",
    },
    {
        value: "boat-trip",
        label: "Boat Trip",
    },
    {
        value: "boat-vip",
        label: "Boat VIP",
    },
];

export const configStatusItems = [
    {
        value: "approved",
        label: "Approved",
        color: "orange-400",
        icon: "pi pi-times",
    },
    {
        value: "partially paid",
        label: "Partially paid",
        color: "yellow-400",
        icon: "pi pi-exclamation-triangle",
    },
    {
        value: "paid",
        label: "Paid",
        color: "green-400",
        icon: "pi pi-check",
    },
    {
        value: "checked in",
        label: "Checked in",
        color: "primary-600",
        icon: "pi pi-id-card",
    },
];

export const configRoleItems = [
    {
        value: "",
        label: "N/A",
        color: "surface-500",
        idList: [],
        search: { flags: { staff: 0, director: 0, guest: 0 } },
    },
    {
        value: "staff",
        label: "Staff",
        color: "orange-400",
        idList: [],
        search: { flags: { staff: 1 } },
    },
    {
        value: "director",
        label: "Director",
        color: "red-400",
        idList: [],
        search: { flags: { director: 1 } },
    },
    {
        value: "vip_reg",
        label: "Black Card VIP",
        color: "gray-700",
        idList: [1192, 1008, 746, 588, 320, 285],
        search: { ids: [1192, 1008, 746, 588, 320, 285] },
    },
    {
        value: "guest",
        label: "Guest of Honor",
        color: "gray-900",
        idList: [],
        search: { flags: { guest: 1 } },
    },
];

export const configSponsorItems = [
    {
        value: "",
        label: "Regular",
        color: "green-400",
        textColor: "white",
        icon: "pi pi-ticket",
        search: { packages: { tshirt: 0, sponsor: 0, sponsor2: 0 } },
    },
    {
        value: "tshirt",
        label: "T-Shirt",
        color: "green-400",
        textColor: "white",
        icon: "pi pi-user",
        search: { packages: { tshirt: 1 } },
    },
    {
        value: "sponsor",
        label: "Sponsor",
        color: "yellow-400",
        textColor: "white",
        icon: "pi pi-angle-up",
        search: { packages: { sponsor: 1 } },
    },
    {
        value: "sponsor2",
        label: "Super-Sponsor",
        color: "purple-400",
        textColor: "white",
        icon: "pi pi-angle-double-up",
        search: { packages: { sponsor2: 1 } },
    },
];

export const configRegdeskSponsorItems = [
    {
        ...configSponsorItems[0],
        ...{ search: { packages: { sponsor: 0, sponsor2: 0 } } },
    },
].concat(configSponsorItems.filter((item) => !["", "tshirt"].includes(item.value)));

export const configTinketItems = [
    {
        value: "tshirt",
        label: "T-Shirt",
    },
    {
        value: "pin",
        label: "Pin",
    },
    {
        value: "cup",
        label: "Cup",
    },
    {
        value: "scarf",
        label: "Scarf",
    },
];

export const configPackageToItemsMap = {
    tshirt: ["tshirt"],
    sponsor: ["tshirt", "cup", "pin"],
    sponsor2: ["tshirt", "scarf", "cup", "pin"],
};

export const configFlagsToItemsMap = {};
