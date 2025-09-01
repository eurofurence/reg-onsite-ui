import type { MetadataRecord } from "@/composables/collection_tools/metadata/getMetadataEntryFromRecord";
import type { LabeledValue } from "@/types/internal/infos";
import { NoPackage } from "@/types/internal/missing";

const enum ArtShowTableApi {
  ast_old_1 = "artshow-table",
  ast_0p5 = "artshow-table-half",
  ast_1p0 = "artshow-table-one",
  ast_1p5 = "artshow-table-oneandhalf",
  ast_2p0 = "artshow-table-two",
  ast_2p5 = "artshow-table-twoandhalf",
  ast_3p0 = "artshow-table-three",
  ast_3p5 = "artshow-table-threeandhalf",
}

export const enum ArtShowTable {
  none = NoPackage.no_package,
  ast_0p5 = ArtShowTableApi.ast_0p5,
  ast_1p0 = ArtShowTableApi.ast_1p0,
  ast_1p5 = ArtShowTableApi.ast_1p5,
  ast_2p0 = ArtShowTableApi.ast_2p0,
  ast_2p5 = ArtShowTableApi.ast_2p5,
  ast_3p0 = ArtShowTableApi.ast_3p0,
  ast_3p5 = ArtShowTableApi.ast_3p5,
}

export type ArtShowTableApiValue = `${ArtShowTableApi}`;
export type ArtShowTableValue = `${ArtShowTable}`;

export const metadataRecordForArtShowTables: MetadataRecord<
  LabeledValue<ArtShowTableValue>
> = {
  [ArtShowTable.none]: { label: "No Art Show Table" },
  [ArtShowTable.ast_0p5]: { label: "AS Table 0.5" },
  [ArtShowTable.ast_1p0]: { label: "AS Table 1.0" },
  [ArtShowTable.ast_1p5]: { label: "AS Table 1.5" },
  [ArtShowTable.ast_2p0]: { label: "AS Table 2.0" },
  [ArtShowTable.ast_2p5]: { label: "AS Table 2.5" },
  [ArtShowTable.ast_3p0]: { label: "AS Table 3.0" },
  [ArtShowTable.ast_3p5]: { label: "AS Table 3.5" },
};
