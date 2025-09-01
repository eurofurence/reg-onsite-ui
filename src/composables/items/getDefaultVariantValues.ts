import { getConcreteItemValue } from "@/composables/items/getConcreteItemValue";
import { getGoodieFromConcreteItem } from "@/composables/items/getGoodieFromConcreteItem";
import { getConventionSetup } from "@/composables/logic/getConventionSetup";
import type { ConcreteGoodieValue, GoodieConfig } from "@/config/convention";
import type { TShirtTypeValue } from "@/config/metadata/tshirt/metadataForTShirtTypes";
import type { ApiSponsorDeskAddInfo } from "@/types/external/attsrv/additional-info/sponsordesk";
import type { TransformedAttendeeInfo } from "@/types/internal/attendee";
import type { DefaultVariantValues } from "@/types/internal/goodies";
import type { LabeledValue } from "@/types/internal/infos";

type LocalDefaultVariantValues = Map<string, string | null>;

function overrideDefaultFromTShirtSizes(
  defaultValues: LocalDefaultVariantValues,
  tshirtSize: TShirtTypeValue | null | undefined
): void {
  const tshirt_goodies: GoodieConfig[] =
    getConventionSetup().metadata.forAbstractGoodies.list.filter(
      (value: GoodieConfig) => value.value.startsWith("tshirt_")
    );
  tshirt_goodies.forEach((value: GoodieConfig) => {
    defaultValues.set(
      value.value,
      tshirtSize !== undefined ? tshirtSize : null
    );
  });
}

function overrideDefaultFromConcreteItems(
  defaultValues: LocalDefaultVariantValues,
  concreteItems: ConcreteGoodieValue[]
): void {
  const itemConfigList: (GoodieConfig | null)[] = concreteItems.map(
    getGoodieFromConcreteItem
  );
  itemConfigList.forEach((goodieConfig: GoodieConfig | null) => {
    goodieConfig?.variants?.forEach(
      (possibleVariantInfo: LabeledValue<string>) => {
        const possibleConcreteItemValue: ConcreteGoodieValue =
          getConcreteItemValue(goodieConfig, possibleVariantInfo);
        if (concreteItems.includes(possibleConcreteItemValue)) {
          defaultValues.set(goodieConfig.value, possibleVariantInfo.value);
        }
      }
    );
  });
}

export function getDefaultVariantValues(
  attendeeInfo: TransformedAttendeeInfo,
  apiSponsorDeskAddInfo: ApiSponsorDeskAddInfo
): DefaultVariantValues {
  let result: LocalDefaultVariantValues = new Map<string, string | null>();
  // Pre-fill T-Shirt defaults with attendee preference
  overrideDefaultFromTShirtSizes(result, attendeeInfo.tshirt_size);
  // Override defaults from past / reserved items
  overrideDefaultFromConcreteItems(result, apiSponsorDeskAddInfo.reservedItems);
  overrideDefaultFromConcreteItems(result, apiSponsorDeskAddInfo.pastItems);
  return result as DefaultVariantValues;
}
