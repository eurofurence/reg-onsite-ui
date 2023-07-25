const formatter = Intl.NumberFormat("en-UK", {
    style: "currency",
    currency: "EUR",
});

export function getDuesText(dues_raw) {
    return formatter.format(dues_raw / 100);
}

export function parseDues(dues_fmt) {
    var thousandSeparator = formatter.format(11111).replace(/\p{Number}/gu, "");
    var decimalSeparator = formatter.format(1.1).replace(/\p{Number}/gu, "");
    const dues_fmt_only = dues_fmt.replace(/[^0-9,.-]+/g, "");
    return parseFloat(dues_fmt_only.replace(new RegExp("\\" + thousandSeparator, "g"), "").replace(new RegExp("\\" + decimalSeparator), ".")) * 100;
}

export function getDuesFlag(dues_raw) {
    if (dues_raw > 0) {
        return "pi pi-exclamation-triangle";
    } else if (dues_raw < 0) {
        return "pi pi-money-bill";
    } else {
        return "";
    }
}

export function getDuesNote(dues_raw) {
    if (dues_raw > 0) {
        return "Not fully paid yet!";
    } else if (dues_raw < 0) {
        return "Too much paid!";
    } else {
        return "";
    }
}
