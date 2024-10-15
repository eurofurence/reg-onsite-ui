import type { LabeledValue } from "@/types/internal/infos";
import type { MetadataRecord } from "@/composables/collection_tools/getMetadataEntry";

export const enum TShirtSize {
  size_xs = "XS",
  size_s = "S",
  size_m = "M",
  size_l = "L",
  size_xl = "XL",
  size_2xl = "2XL",
  size_3xl = "3XL",
  size_4xl = "4XL",
}

export type TShirtSizeValue = `${TShirtSize}`;

export const metadataRecordForTShirtSizes: MetadataRecord<
  LabeledValue<TShirtSizeValue>
> = {
  [TShirtSize.size_xs]: { label: "X-Small" },
  [TShirtSize.size_s]: { label: "Small" },
  [TShirtSize.size_m]: { label: "Medium" },
  [TShirtSize.size_l]: { label: "Large" },
  [TShirtSize.size_xl]: { label: "X-Large" },
  [TShirtSize.size_2xl]: { label: "XX-Large" },
  [TShirtSize.size_3xl]: { label: "3X-Large" },
  [TShirtSize.size_4xl]: { label: "4X-Large" },
};
