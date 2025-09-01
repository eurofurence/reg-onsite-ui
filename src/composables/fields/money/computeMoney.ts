import type { MoneyInCent } from "@/types/external/attsrv/attendees/attendee";
import { type Ref, type WritableComputedRef, computed } from "vue";

const moneyFormatter: Intl.NumberFormat = Intl.NumberFormat("en-UK", {
  style: "currency",
  currency: "EUR",
});

const thousandSeparator: string = moneyFormatter
  .format(11111)
  .replace(/\p{Number}/gu, "");
const decimalSeparator: string = moneyFormatter
  .format(1.1)
  .replace(/\p{Number}/gu, "");

export function getMoney(data: MoneyInCent): string {
  return moneyFormatter.format(data / 100);
}

function setMoney(moneyValue: string): MoneyInCent {
  const moneyValueOnly: string = moneyValue.replace(/[^0-9,.-]+/g, "");
  const moneyValueNoTSep: string = moneyValueOnly.replace(
    new RegExp("\\" + thousandSeparator, "g"),
    ""
  );
  const moneyValueUniform: string = moneyValueNoTSep.replace(
    new RegExp("\\" + decimalSeparator),
    "."
  );
  return (Number.parseFloat(moneyValueUniform) * 100) as MoneyInCent;
}

export function computeMoney(
  dataRef: Ref<number | null>
): WritableComputedRef<string> {
  return computed<string>({
    get: () => getMoney((dataRef?.value as MoneyInCent) || (0 as MoneyInCent)),
    set: (new_value: string) => {
      dataRef.value = setMoney(new_value);
    },
  });
}
