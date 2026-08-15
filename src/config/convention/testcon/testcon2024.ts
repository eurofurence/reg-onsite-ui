import type { MetadataRecord } from "@/composables/collection_tools/metadata/getMetadataEntryFromRecord";
import { GoodiesLevel } from "@/config/metadata/packages/metadataForPerks";
import {
  metadataListForTShirtTypesInternal,
  type TShirtTypeValue,
} from "@/config/metadata/tshirt/metadataForTShirtTypes";
import type {
  ConDays,
  ConventionIterationSettings,
} from "@/types/internal/convention";
import type { GenericGoodieConfig } from "@/types/internal/goodies";
import type { LabeledValue } from "@/types/internal/infos";

export const enum AbstractTCGoodieWithoutVariants2024 {
  staff_coin_2024 = "coin_2024",
  pin_2024 = "pin_2024",
  bag_2024 = "bag_2024",
}

export const enum AbstractTCGoodieWithVariants2024 {
  tshirt_2024 = "tshirt_2024",
}

export type ConcreteTCGoodieValue2024 =
  | `${AbstractTCGoodieWithoutVariants2024}`
  | `${AbstractTCGoodieWithVariants2024.tshirt_2024}_${TShirtTypeValue}`;

export type TCGoodieConfig2024 =
  | GenericGoodieConfig<AbstractTCGoodieWithoutVariants2024, null, null>
  | GenericGoodieConfig<
      AbstractTCGoodieWithVariants2024.tshirt_2024,
      LabeledValue<TShirtTypeValue>[],
      TShirtTypeValue
    >;

export const metadataRecordForGoodies2024: MetadataRecord<TCGoodieConfig2024> =
  {
    [AbstractTCGoodieWithVariants2024.tshirt_2024]: {
      label: "T-Shirt",
      variants: metadataListForTShirtTypesInternal,
    },
    [AbstractTCGoodieWithoutVariants2024.staff_coin_2024]: {
      label: "Staff Coin",
    },
    [AbstractTCGoodieWithoutVariants2024.pin_2024]: {
      label: "Pin",
    },
    [AbstractTCGoodieWithoutVariants2024.bag_2024]: {
      label: "Bag",
    },
  };

export const iterationTC2024: ConventionIterationSettings = {
  conDates: { start: new Date("2024-09-18"), days: 4 as ConDays },
  vip: { regNumberList: [] },
  goodies: {
    forPackage: {
      [GoodiesLevel.tshirt]: [AbstractTCGoodieWithVariants2024.tshirt_2024],
      [GoodiesLevel.sponsor]: [
        AbstractTCGoodieWithVariants2024.tshirt_2024,
        AbstractTCGoodieWithoutVariants2024.pin_2024,
      ],
      [GoodiesLevel.super_sponsor]: [
        AbstractTCGoodieWithVariants2024.tshirt_2024,
        AbstractTCGoodieWithoutVariants2024.pin_2024,
        AbstractTCGoodieWithoutVariants2024.bag_2024,
      ],
    },
    forFlag: {
      staff: [AbstractTCGoodieWithoutVariants2024.staff_coin_2024],
      director: [AbstractTCGoodieWithoutVariants2024.staff_coin_2024],
    },
    forRegNumber: {},
  },
};
