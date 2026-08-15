import type { MetadataRecord } from "@/composables/collection_tools/metadata/getMetadataEntryFromRecord";
import {
  metadataListForTShirtTypesInternal,
  type TShirtTypeValue,
} from "@/config/metadata/tshirt/metadataForTShirtTypes";
import type { GenericGoodieConfig } from "@/types/internal/goodies";
import type { LabeledValue } from "@/types/internal/infos";

export const enum AbstractTCGoodieWithoutVariants2023 {
  pin_2023 = "pin_2023",
}

export const enum AbstractTCGoodieWithVariants2023 {
  tshirt_2023 = "tshirt_2023",
}

export type ConcreteTCGoodieValue2023 =
  | `${AbstractTCGoodieWithoutVariants2023}`
  | `${AbstractTCGoodieWithVariants2023.tshirt_2023}_${TShirtTypeValue}`;

export type TCGoodieConfig2023 =
  | GenericGoodieConfig<AbstractTCGoodieWithoutVariants2023, null, null>
  | GenericGoodieConfig<
      AbstractTCGoodieWithVariants2023.tshirt_2023,
      LabeledValue<TShirtTypeValue>[],
      TShirtTypeValue
    >;

export const metadataRecordForGoodies2023: MetadataRecord<TCGoodieConfig2023> =
  {
    [AbstractTCGoodieWithVariants2023.tshirt_2023]: {
      label: "T-Shirt (2023)",
      variants: metadataListForTShirtTypesInternal,
    },
    [AbstractTCGoodieWithoutVariants2023.pin_2023]: {
      label: "Pin (2023)",
    },
  };
