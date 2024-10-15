import type {
  ConDays,
  ConventionIterationSettings,
} from "@/types/internal/convention";
import GoodiesLevel from "@/components/field/GoodiesLevel.vue";
import type { GenericGoodieConfig } from "@/types/internal/goodies";
import type { LabeledValue } from "@/types/internal/infos";
import {
  metadataListForTShirtTypesInternal,
  type TShirtTypeValue,
} from "@/config/metadata/tshirt/metadataForTShirtTypes";
import type { MetadataRecord } from "@/composables/collection_tools/getMetadataEntry";

export const enum AbstractEFGoodieWithoutVariants2024 {
  staff_coin_2024 = "coin_2024",
  pin_2024 = "pin_2024",
  luggage_strap_2024 = "luggage_strap_2024",
  bag_2024 = "bag_2024",
  led_badge_2024 = "led_badge_2024",
}

export const enum AbstractEFGoodieWithVariants2024 {
  tshirt_2024 = "tshirt_2024",
}

export type ConcreteEFGoodieValue2024 =
  | `${AbstractEFGoodieWithoutVariants2024}`
  | `${AbstractEFGoodieWithVariants2024.tshirt_2024}_${TShirtTypeValue}`;

export type EFGoodieConfig2024 =
  | GenericGoodieConfig<AbstractEFGoodieWithoutVariants2024, null, null>
  | GenericGoodieConfig<
      AbstractEFGoodieWithVariants2024.tshirt_2024,
      LabeledValue<TShirtTypeValue>[],
      TShirtTypeValue
    >;

export const metadataRecordForGoodies2024: MetadataRecord<EFGoodieConfig2024> =
  {
    [AbstractEFGoodieWithVariants2024.tshirt_2024]: {
      label: "T-Shirt",
      variants: metadataListForTShirtTypesInternal,
    },
    [AbstractEFGoodieWithoutVariants2024.staff_coin_2024]: {
      label: "Staff Coin",
    },
    [AbstractEFGoodieWithoutVariants2024.pin_2024]: {
      label: "Pin",
    },
    [AbstractEFGoodieWithoutVariants2024.luggage_strap_2024]: {
      label: "Luggage Strap",
    },
    [AbstractEFGoodieWithoutVariants2024.bag_2024]: {
      label: "Bag",
    },
    [AbstractEFGoodieWithoutVariants2024.led_badge_2024]: {
      label: "LED Badge",
    },
  };

export const iterationEF2024: ConventionIterationSettings = {
  conDates: { start: new Date("2024-09-18"), days: 4 as ConDays },
  vip: { regNumberList: [] },
  goodies: {
    forPackage: {
      [GoodiesLevel.tshirt]: [AbstractEFGoodieWithVariants2024.tshirt_2024],
      [GoodiesLevel.sponsor]: [
        AbstractEFGoodieWithVariants2024.tshirt_2024,
        AbstractEFGoodieWithoutVariants2024.pin_2024,
        AbstractEFGoodieWithoutVariants2024.luggage_strap_2024,
      ],
      [GoodiesLevel.super_sponsor]: [
        AbstractEFGoodieWithVariants2024.tshirt_2024,
        AbstractEFGoodieWithoutVariants2024.pin_2024,
        AbstractEFGoodieWithoutVariants2024.luggage_strap_2024,
        AbstractEFGoodieWithoutVariants2024.bag_2024,
        AbstractEFGoodieWithoutVariants2024.led_badge_2024,
      ],
    },
    forFlag: {
      staff: [AbstractEFGoodieWithoutVariants2024.staff_coin_2024],
      director: [AbstractEFGoodieWithoutVariants2024.staff_coin_2024],
    },
    forRegNumber: {},
  },
};
