import { getAbstractFromConcreteItems } from "@/composables/items/getAbstractFromConcreteItems";
import { getConcreteItemValue } from "@/composables/items/getConcreteItemValue";
import { getDefaultVariantValues } from "@/composables/items/getDefaultVariantValues";
import { getDefaultVariantValuesValue } from "@/composables/items/getDefaultVariantValuesValue";
import { getEntitledAbstractItems } from "@/composables/items/getEntitledAbstractItems";
import { getRecordedConcreteItems } from "@/composables/items/getRecordedConcreteItems";
import { getGoodieFromAbstractItem } from "@/composables/items/getGoodieFromAbstractItem";
import type {
  AbstractGoodieValue,
  ConcreteGoodieValue,
  GoodieConfig,
} from "@/config/convention";
import type { ApiSponsorDeskAddInfo } from "@/types/external/attsrv/additional-info/sponsordesk";
import type { RegNumber } from "@/types/external/attsrv/attendees/attendee";
import type { TransformedAttendeeInfo } from "@/types/internal/attendee";
import type { DefaultVariantValues } from "@/types/internal/goodies";
import type { LabeledValue } from "@/types/internal/infos";

function getLabeledValue(
  defaultVariantValues: DefaultVariantValues,
  abstractGoodieValue: AbstractGoodieValue
): LabeledValue<string | null> | null {
  const defaultVariantValuesValue: string | null | undefined =
    getDefaultVariantValuesValue(defaultVariantValues, abstractGoodieValue);
  if (defaultVariantValuesValue !== undefined) {
    return {
      label: "",
      value: defaultVariantValuesValue,
    };
  }
  return null;
}

// Only the items the attendee is entitled to but has NOT yet had recorded
// against them (not in pastItems/issuedItems/reservedItems). Use this for
// "Owed"/"Bought"/"Planned" style displays — getConcreteItemsEntitlement()
// includes already-recorded items too and will double-count them if used
// for those.
export function getMissingConcreteItems(
  attendee: TransformedAttendeeInfo,
  apiSponsorDeskAddInfo: ApiSponsorDeskAddInfo
): ConcreteGoodieValue[] {
  const recordedConcreteItemsFromSponsorInfo: ConcreteGoodieValue[] =
    getRecordedConcreteItems(apiSponsorDeskAddInfo);
  const recordedAbstractItemsFromSponsorInfo: AbstractGoodieValue[] =
    getAbstractFromConcreteItems(recordedConcreteItemsFromSponsorInfo);
  const entitledAbstractItemsFromAttendeeInfo: AbstractGoodieValue[] =
    getEntitledAbstractItems(
      attendee.packages_list || [],
      attendee.flags_list || [],
      attendee.id || (0 as RegNumber)
    );
  const missingAbstractItems = entitledAbstractItemsFromAttendeeInfo.filter(
    (abstractItemFromAttendeeInfo: AbstractGoodieValue) =>
      !recordedAbstractItemsFromSponsorInfo.includes(abstractItemFromAttendeeInfo)
  );
  const defaultVariantValues: DefaultVariantValues = getDefaultVariantValues(
    attendee,
    apiSponsorDeskAddInfo
  );
  const goodieConfigList: (GoodieConfig | null)[] = missingAbstractItems.map(
    getGoodieFromAbstractItem
  );
  const cleanedGoodieConfigList: GoodieConfig[] = goodieConfigList.filter(
    (goodieConfig: GoodieConfig | null) => goodieConfig !== null
  );
  return cleanedGoodieConfigList.map(
    (goodieConfig: GoodieConfig) =>
      getConcreteItemValue(
        goodieConfig,
        getLabeledValue(defaultVariantValues, goodieConfig.value)
      )
  );
}
