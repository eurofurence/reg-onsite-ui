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

export const enum AbstractEFGoodieWithoutVariants2025 {
  placeholder_2025 = "placeholder_2025",
}

export const enum AbstractEFGoodieWithVariants2025 {
  tshirt_2025 = "tshirt_2025",
}

export type ConcreteEFGoodieValue2025 =
  | `${AbstractEFGoodieWithoutVariants2025}`
  | `${AbstractEFGoodieWithVariants2025.tshirt_2025}_${TShirtTypeValue}`;

export type EFGoodieConfig2025 =
  | GenericGoodieConfig<AbstractEFGoodieWithoutVariants2025, null, null>
  | GenericGoodieConfig<
      AbstractEFGoodieWithVariants2025.tshirt_2025,
      LabeledValue<TShirtTypeValue>[],
      TShirtTypeValue
    >;

export const metadataRecordForGoodies2025: MetadataRecord<EFGoodieConfig2025> =
  {
    [AbstractEFGoodieWithVariants2025.tshirt_2025]: {
      label: "T-Shirt",
      variants: metadataListForTShirtTypesInternal,
    },
    [AbstractEFGoodieWithoutVariants2025.placeholder_2025]: {
      label: "tbd",
    },
  };

export const iterationEF2025: ConventionIterationSettings = {
  conDates: { start: new Date("2024-09-03"), days: 4 as ConDays },
  vip: { regNumberList: [] },
  goodies: {
    forPackage: {
      [GoodiesLevel.tshirt]: [AbstractEFGoodieWithVariants2025.tshirt_2025],
      [GoodiesLevel.sponsor]: [
        AbstractEFGoodieWithVariants2025.tshirt_2025,
        AbstractEFGoodieWithoutVariants2025.placeholder_2025,
      ],
      [GoodiesLevel.super_sponsor]: [
        AbstractEFGoodieWithVariants2025.tshirt_2025,
        AbstractEFGoodieWithoutVariants2025.placeholder_2025,
      ],
    },
    forFlag: {},
    forRegNumber: {},
  },
};
