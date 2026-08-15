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

export const enum AbstractTCGoodieWithoutVariants2025 {
  messenger_bag_2025 = "messenger_bag_2025",
  staff_coin_2025 = "staff_coin_2025",
  sponsor_pin_2025 = "attendee_pin_2025",
}

export const enum AbstractTCGoodieWithVariants2025 {
  tshirt_2025 = "tshirt_2025",
}

export type ConcreteTCGoodieValue2025 =
  | `${AbstractTCGoodieWithoutVariants2025}`
  | `${AbstractTCGoodieWithVariants2025.tshirt_2025}_${TShirtTypeValue}`;

export type TCGoodieConfig2025 =
  | GenericGoodieConfig<AbstractTCGoodieWithoutVariants2025, null, null>
  | GenericGoodieConfig<
      AbstractTCGoodieWithVariants2025.tshirt_2025,
      LabeledValue<TShirtTypeValue>[],
      TShirtTypeValue
    >;

export const metadataRecordForGoodies2025: MetadataRecord<TCGoodieConfig2025> =
  {
    [AbstractTCGoodieWithVariants2025.tshirt_2025]: {
      label: "T-Shirt",
      variants: metadataListForTShirtTypesInternal,
    },
    [AbstractTCGoodieWithoutVariants2025.messenger_bag_2025]: {
      label: "Messenger Bag",
    },
    [AbstractTCGoodieWithoutVariants2025.staff_coin_2025]: {
      label: "Staff Coin",
    },
    [AbstractTCGoodieWithoutVariants2025.sponsor_pin_2025]: {
      label: "Pin",
    },
  };

export const iterationTC2025: ConventionIterationSettings = {
  conDates: { start: new Date("2025-09-03"), days: 4 as ConDays },
  vip: { regNumberList: [] },
  goodies: {
    forPackage: {
      [GoodiesLevel.tshirt]: [
        AbstractTCGoodieWithVariants2025.tshirt_2025,
      ],
      [GoodiesLevel.sponsor]: [
        AbstractTCGoodieWithVariants2025.tshirt_2025,
        AbstractTCGoodieWithoutVariants2025.sponsor_pin_2025,
      ],
      [GoodiesLevel.super_sponsor]: [
        AbstractTCGoodieWithVariants2025.tshirt_2025,
        AbstractTCGoodieWithoutVariants2025.sponsor_pin_2025,
        AbstractTCGoodieWithoutVariants2025.messenger_bag_2025,
      ],
    },
    forFlag: {
      staff: [
        AbstractTCGoodieWithoutVariants2025.staff_coin_2025,
      ],
      director: [
        AbstractTCGoodieWithoutVariants2025.staff_coin_2025,
      ],
    },
    forRegNumber: {},
  },
};
