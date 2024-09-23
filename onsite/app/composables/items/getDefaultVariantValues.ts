import { getConcreteItemValue } from "@/composables/items/getConcreteItemValue";
import { getTrinketFromConcreteItem } from "@/composables/items/getTrinketFromConcreteItem";
import type { TShirtTypeValue } from "@/config/tshirt/setupTShirtTypes";
import {
  type ConcreteTrinketValue,
  type TrinketConfig,
  configTinketItems,
} from "@/setupEFIteration";
import type { ApiSponsorDeskAddInfo } from "@/types/external";
import type {
  TransformedAttendeeInfo,
  DefaultVariantValues,
  LabeledValue,
} from "@/types/internal";

type LocalDefaultVariantValues = Map<string, string | null>;

function overrideDefaultFromTShirtSizes(
  defaultValues: LocalDefaultVariantValues,
  tshirtSize: TShirtTypeValue | null | undefined
): void {
  const tshirt_trinkets: TrinketConfig[] = configTinketItems.filter(
    (value: TrinketConfig) => value.value.startsWith("tshirt_")
  );
  tshirt_trinkets.forEach((value: TrinketConfig) => {
    defaultValues.set(
      value.value,
      tshirtSize !== undefined ? tshirtSize : null
    );
  });
}

function overrideDefaultFromConcreteItems(
  defaultValues: LocalDefaultVariantValues,
  concreteItems: ConcreteTrinketValue[]
): void {
  const itemConfigList: (TrinketConfig | null)[] = concreteItems.map(
    getTrinketFromConcreteItem
  );
  itemConfigList.forEach((trinketConfig: TrinketConfig | null) => {
    trinketConfig?.variants?.forEach(
      (possibleVariantInfo: LabeledValue<string>) => {
        const possibleConcreteItemValue: ConcreteTrinketValue =
          getConcreteItemValue(trinketConfig, possibleVariantInfo);
        if (concreteItems.includes(possibleConcreteItemValue)) {
          defaultValues.set(trinketConfig.value, possibleVariantInfo.value);
        }
      }
    );
  });
}

export function getDefaultVariantValues(
  attendeeInfo: TransformedAttendeeInfo,
  apiSponsorDeskAddInfo: ApiSponsorDeskAddInfo
): DefaultVariantValues {
  var result: LocalDefaultVariantValues = new Map<string, string | null>();
  // Pre-fill T-Shirt defaults with attendee preference
  overrideDefaultFromTShirtSizes(result, attendeeInfo.tshirt_size);
  // Override defaults from past / reserved items
  overrideDefaultFromConcreteItems(result, apiSponsorDeskAddInfo.reservedItems);
  overrideDefaultFromConcreteItems(result, apiSponsorDeskAddInfo.pastItems);
  return result as DefaultVariantValues;
}
