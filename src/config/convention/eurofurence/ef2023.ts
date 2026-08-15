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

export const enum AbstractEFGoodieWithoutVariants2023 {
  pin_2023 = "pin_2023",
  cup_2023 = "cup_2023",
  scarf_2023 = "scarf_2023",
}

export const enum AbstractEFGoodieWithVariants2023 {
  tshirt_2023 = "tshirt_2023",
}

export type ConcreteEFGoodieValue2023 =
  | `${AbstractEFGoodieWithoutVariants2023}`
  | `${AbstractEFGoodieWithVariants2023.tshirt_2023}_${TShirtTypeValue}`;

export type EFGoodieConfig2023 =
  | GenericGoodieConfig<AbstractEFGoodieWithoutVariants2023, null, null>
  | GenericGoodieConfig<
      AbstractEFGoodieWithVariants2023.tshirt_2023,
      LabeledValue<TShirtTypeValue>[],
      TShirtTypeValue
    >;

export const metadataRecordForGoodies2023: MetadataRecord<EFGoodieConfig2023> =
  {
    [AbstractEFGoodieWithVariants2023.tshirt_2023]: {
      label: "T-Shirt (2023)",
      variants: metadataListForTShirtTypesInternal,
    },
    [AbstractEFGoodieWithoutVariants2023.pin_2023]: {
      label: "Pin (2023)",
    },
    [AbstractEFGoodieWithoutVariants2023.cup_2023]: {
      label: "Cup (2023)",
    },
    [AbstractEFGoodieWithoutVariants2023.scarf_2023]: {
      label: "Scarf (2023)",
    },
  };

export const iterationEF2023: ConventionIterationSettings = {
  conDates: { start: new Date("2023-09-03"), days: 4 as ConDays },
  vip: { regNumberList: [] },
  goodies: {
    forPackage: {
      [GoodiesLevel.tshirt]: [AbstractEFGoodieWithVariants2023.tshirt_2023],
      [GoodiesLevel.sponsor]: [
        AbstractEFGoodieWithVariants2023.tshirt_2023,
        AbstractEFGoodieWithoutVariants2023.pin_2023,
        AbstractEFGoodieWithoutVariants2023.cup_2023,
      ],
      [GoodiesLevel.super_sponsor]: [
        AbstractEFGoodieWithVariants2023.tshirt_2023,
        AbstractEFGoodieWithoutVariants2023.pin_2023,
        AbstractEFGoodieWithoutVariants2023.cup_2023,
        AbstractEFGoodieWithoutVariants2023.scarf_2023,
      ],
    },
    forFlag: {},
    forRegNumber: {},
  },
};
