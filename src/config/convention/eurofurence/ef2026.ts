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

export const enum AbstractEFGoodieWithoutVariants2026 {
  messenger_bag_2026 = "messenger_bag_2026",
  festival_3cups_2026 = "festival_3cups_2026",
  paper_fan_2026 = "paper_fan_2026",
  staff_coin_2026 = "staff_coin_2026",
  sponsor_pin_2026 = "attendee_pin_2026",

  critter_postcard_2026 = "critter_postcard_2026",
  critter_bookmark_2026 = "critter_bookmark_2026",
  critter_volunteer_pin_2026 = "critter_volunteer_pin_2026",
  critter_stressball_2026 = "critter_stressball_2026",
  critter_festival_cup_2026 = "critter_festival_cup_2026",
  critter_festival_wristband_2026 = "critter_festival_wristband_2026",
}

export const enum AbstractEFGoodieWithVariants2026 {
  tshirt_2026 = "tshirt_2026",
}

export type ConcreteEFGoodieValue2026 =
  | `${AbstractEFGoodieWithoutVariants2026}`
  | `${AbstractEFGoodieWithVariants2026.tshirt_2026}_${TShirtTypeValue}`;

export type EFGoodieConfig2026 =
  | GenericGoodieConfig<AbstractEFGoodieWithoutVariants2026, null, null>
  | GenericGoodieConfig<
      AbstractEFGoodieWithVariants2026.tshirt_2026,
      LabeledValue<TShirtTypeValue>[],
      TShirtTypeValue
    >;

export const metadataRecordForGoodies2026: MetadataRecord<EFGoodieConfig2026> =
  {
    [AbstractEFGoodieWithVariants2026.tshirt_2026]: {
      label: "T-Shirt",
      variants: metadataListForTShirtTypesInternal,
    },
    [AbstractEFGoodieWithoutVariants2026.paper_fan_2026]: {
      label: "Paper Fan",
    },
    [AbstractEFGoodieWithoutVariants2026.festival_3cups_2026]: {
      label: "3 Festival Cups",
    },
    [AbstractEFGoodieWithoutVariants2026.messenger_bag_2026]: {
      label: "Messenger Bag",
    },
    [AbstractEFGoodieWithoutVariants2026.staff_coin_2026]: {
      label: "Staff Coin",
    },
    [AbstractEFGoodieWithoutVariants2026.sponsor_pin_2026]: {
      label: "Pin",
    },
    [AbstractEFGoodieWithoutVariants2026.critter_volunteer_pin_2026]: {
      label: "Benefit: Volunteer Pin",
    },
    [AbstractEFGoodieWithoutVariants2026.critter_stressball_2026]: {
      label: "Benefit: Stress Ball",
    },
    [AbstractEFGoodieWithoutVariants2026.critter_festival_cup_2026]: {
      label: "Benefit: Festival Cup",
    },
    [AbstractEFGoodieWithoutVariants2026.critter_bookmark_2026]: {
      label: "Benefit: Bookmark",
    },
    [AbstractEFGoodieWithoutVariants2026.critter_postcard_2026]: {
      label: "Benefit: Postcard",
    },
    [AbstractEFGoodieWithoutVariants2026.critter_festival_wristband_2026]: {
      label: "Benefit: Festival Wristband",
    }
  };

export const iterationEF2026: ConventionIterationSettings = {
  conDates: { start: new Date("2026-08-19"), days: 4 as ConDays },
  vip: { regNumberList: [] },
  goodies: {
    forPackage: {
      [GoodiesLevel.tshirt]: [
        AbstractEFGoodieWithVariants2026.tshirt_2026,
      ],
      [GoodiesLevel.sponsor]: [
        AbstractEFGoodieWithVariants2026.tshirt_2026,
        AbstractEFGoodieWithoutVariants2026.sponsor_pin_2026,
        AbstractEFGoodieWithoutVariants2026.paper_fan_2026,
        AbstractEFGoodieWithoutVariants2026.festival_3cups_2026,
      ],
      [GoodiesLevel.super_sponsor]: [
        AbstractEFGoodieWithVariants2026.tshirt_2026,
        AbstractEFGoodieWithoutVariants2026.sponsor_pin_2026,
        AbstractEFGoodieWithoutVariants2026.paper_fan_2026,
        AbstractEFGoodieWithoutVariants2026.festival_3cups_2026,
        AbstractEFGoodieWithoutVariants2026.messenger_bag_2026,
      ],
    },
    forFlag: {
      staff: [
        AbstractEFGoodieWithoutVariants2026.critter_postcard_2026,
        AbstractEFGoodieWithoutVariants2026.critter_bookmark_2026,
        AbstractEFGoodieWithoutVariants2026.critter_volunteer_pin_2026,
        AbstractEFGoodieWithoutVariants2026.critter_stressball_2026,
        AbstractEFGoodieWithoutVariants2026.critter_festival_cup_2026,
        AbstractEFGoodieWithoutVariants2026.critter_festival_wristband_2026,
        AbstractEFGoodieWithoutVariants2026.staff_coin_2026,
      ],
      director: [
        AbstractEFGoodieWithoutVariants2026.critter_postcard_2026,
        AbstractEFGoodieWithoutVariants2026.critter_bookmark_2026,
        AbstractEFGoodieWithoutVariants2026.critter_volunteer_pin_2026,
        AbstractEFGoodieWithoutVariants2026.critter_stressball_2026,
        AbstractEFGoodieWithoutVariants2026.critter_festival_cup_2026,
        AbstractEFGoodieWithoutVariants2026.critter_festival_wristband_2026,
        AbstractEFGoodieWithoutVariants2026.staff_coin_2026,
      ],
    },
    forRegNumber: {},
  },
};
