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

export const enum AbstractTCGoodieWithoutVariants2026 {
  paper_fan_2026 = "paper_fan_2026",
  staff_coin_2026 = "staff_coin_2026",
  sponsor_pin_2026 = "attendee_pin_2026",
}

export const enum AbstractTCGoodieWithVariants2026 {
  tshirt_2026 = "tshirt_2026",
  tshirt_staff_2026 = "tshirt_staff_2026",
}

export type ConcreteTCGoodieValue2026 =
  | `${AbstractTCGoodieWithoutVariants2026}`
  | `${AbstractTCGoodieWithVariants2026.tshirt_2026}_${TShirtTypeValue}`
  | `${AbstractTCGoodieWithVariants2026.tshirt_staff_2026}_${TShirtTypeValue}`;

export type TCGoodieConfig2026 =
  | GenericGoodieConfig<AbstractTCGoodieWithoutVariants2026, null, null>
  | GenericGoodieConfig<
      AbstractTCGoodieWithVariants2026.tshirt_2026,
      LabeledValue<TShirtTypeValue>[],
      TShirtTypeValue
    >
  | GenericGoodieConfig<
      AbstractTCGoodieWithVariants2026.tshirt_staff_2026,
      LabeledValue<TShirtTypeValue>[],
      TShirtTypeValue
    >;

export const metadataRecordForGoodies2026: MetadataRecord<TCGoodieConfig2026> =
  {
    [AbstractTCGoodieWithVariants2026.tshirt_2026]: {
      label: "T-Shirt",
      variants: metadataListForTShirtTypesInternal,
    },
    [AbstractTCGoodieWithVariants2026.tshirt_staff_2026]: {
      label: "Staff T-Shirt",
      variants: metadataListForTShirtTypesInternal,
    },
    [AbstractTCGoodieWithoutVariants2026.paper_fan_2026]: {
      label: "Paper Fan",
    },
    [AbstractTCGoodieWithoutVariants2026.staff_coin_2026]: {
      label: "Staff Coin",
    },
    [AbstractTCGoodieWithoutVariants2026.sponsor_pin_2026]: {
      label: "Pin",
    },
  };

export const iterationTC2026: ConventionIterationSettings = {
  conDates: { start: new Date("2026-08-19"), days: 4 as ConDays },
  vip: { regNumberList: [] },
  goodies: {
    forPackage: {
      [GoodiesLevel.tshirt]: [
        AbstractTCGoodieWithVariants2026.tshirt_2026,
      ],
      [GoodiesLevel.sponsor]: [
        AbstractTCGoodieWithVariants2026.tshirt_2026,
        AbstractTCGoodieWithoutVariants2026.sponsor_pin_2026,
        AbstractTCGoodieWithoutVariants2026.paper_fan_2026,
      ],
      [GoodiesLevel.super_sponsor]: [
        AbstractTCGoodieWithVariants2026.tshirt_2026,
        AbstractTCGoodieWithoutVariants2026.sponsor_pin_2026,
        AbstractTCGoodieWithoutVariants2026.paper_fan_2026,
      ],
    },
    forFlag: {
      staff: [
        AbstractTCGoodieWithoutVariants2026.staff_coin_2026,
      ],
      director: [
        AbstractTCGoodieWithoutVariants2026.staff_coin_2026,
      ],
    },
    forRegNumber: {},
  },
};
