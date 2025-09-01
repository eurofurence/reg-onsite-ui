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

function getBirthdayFilterStringInternal(value: string): string | null {
  const [year, month, day]: string[] = value.split("-");
  let result: string | null = null;

  const [yearStop, yearParsed, _yearIncludeDash]: ParseDateElementResult =
    parseDateElement(year, "y");
  if (yearParsed === null) {
    return result;
  }
  result = yearParsed;
  if (yearStop) {
    return result;
  }

  const [monthStop, monthParsed, monthIncludeDash]: ParseDateElementResult =
    parseDateElement(month, "m");
  if (monthParsed === null) {
    return result;
  }
  result += `-${monthParsed}`;
  if (monthStop) {
    if (monthIncludeDash) {
      result += "-";
    }
    return result;
  }

  const [, dayParsed, dayIncludeDash]: ParseDateElementResult =
    parseDateElement(day, "d");
  if (dayParsed === null) {
    if (monthIncludeDash) {
      result += "-";
    }
    return result;
  }
  result += `-${dayParsed}`;
  if (dayIncludeDash) {
    result += "-";
  }
  return result;
}

export function getBirthdayFilterString(
  rawFilterString: string
): string | null {
  let result: string | null = null;
  if (rawFilterString.endsWith("-") || rawFilterString.endsWith("-0")) {
    result =
      getBirthdayFilterStringInternal(
        stripCharacterFromRight(rawFilterString, "-")
      ) + "-";
  } else {
    result = getBirthdayFilterStringInternal(rawFilterString);
  }
  if (result) {
    return result.replace("--", "-");
  }
  return result;
}
