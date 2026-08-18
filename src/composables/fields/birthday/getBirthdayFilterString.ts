function stripCharacterFromRight(
  inputString: string,
  character: string
): string {
  while (inputString.endsWith(character)) {
    inputString = inputString.slice(0, -1);
  }
  return inputString;
}

type ParseDateElementResult = [boolean, string, boolean] | [boolean, null];

function parseDateElement(
  value: string | undefined,
  placeholder: "y" | "m" | "d"
): ParseDateElementResult {
  let doStop = false;
  let includeDash = false;
  if (value?.includes(placeholder)) {
    value = stripCharacterFromRight(value, placeholder);
    doStop = true;
  }
  if (value?.startsWith("0")) {
    includeDash = true;
  }
  const parsedValue = Number(value);
  if (isNaN(parsedValue) || parsedValue === 0) {
    return [doStop, null];
  }
  return [doStop, `${parsedValue}`, includeDash];
}

export type BirthdayFilterResult = {
  value: string;
  matchMode: "startsWith" | "equals";
};

function getBirthdayFilterStringInternal(
  value: string
): BirthdayFilterResult | null {
  const [year, month, day]: string[] = value.split("-");
  let result: string | null = null;

  const [yearStop, yearParsed, _yearIncludeDash]: ParseDateElementResult =
    parseDateElement(year, "y");
  if (yearParsed === null) {
    return null;
  }
  result = yearParsed;
  if (yearStop) {
    return { value: result, matchMode: "startsWith" };
  }

  const [monthStop, monthParsed, monthIncludeDash]: ParseDateElementResult =
    parseDateElement(month, "m");
  if (monthParsed === null) {
    return { value: result, matchMode: "startsWith" };
  }
  result += `-${monthParsed}`;
  if (monthStop) {
    if (monthIncludeDash) {
      result += "-";
    }
    return { value: result, matchMode: "startsWith" };
  }

  const [, dayParsed, dayIncludeDash]: ParseDateElementResult =
    parseDateElement(day, "d");
  if (dayParsed === null) {
    if (monthIncludeDash) {
      result += "-";
    }
    return { value: result, matchMode: "startsWith" };
  }
  result += `-${dayParsed}`;
  const matchMode = dayIncludeDash ? "equals" : "startsWith";
  return { value: result, matchMode };
}

export function getBirthdayFilterString(
  rawFilterString: string
): BirthdayFilterResult | null {
  let internal: BirthdayFilterResult | null = null;
  if (rawFilterString.endsWith("-") || rawFilterString.endsWith("-0")) {
    internal = getBirthdayFilterStringInternal(
      stripCharacterFromRight(rawFilterString, "-")
    );
    if (internal) {
      internal = { value: internal.value + "-", matchMode: "startsWith" };
    }
  } else {
    internal = getBirthdayFilterStringInternal(rawFilterString);
  }
  if (internal) {
    return { value: internal.value.replace("--", "-"), matchMode: internal.matchMode };
  }
  return null;
}
