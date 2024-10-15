import { ColorsPalette } from "@/composables/theme/colors";
import type { ConBookInfo } from "@/types/internal/infos";
import type { MetadataRecord } from "@/composables/collection_tools/getMetadataEntry";

const enum ConBookApi {
  digital = "digi-book",
}

const enum ConBook {
  physical = "",
  digital = ConBookApi.digital,
}

export type ConBookApiValue = `${ConBookApi}`;
export type ConBookValue = `${ConBook}`;

export const metadataRecordForConBookChoice: MetadataRecord<ConBookInfo> = {
  [ConBook.physical]: {
    label: "Physical",
    color: ColorsPalette.primary_600,
    search: { flags: { [ConBookApi.digital]: 0 } },
  },
  [ConBook.digital]: {
    label: "Digital",
    color: ColorsPalette.primary_400,
    search: { flags: { [ConBookApi.digital]: 1 } },
  },
};
