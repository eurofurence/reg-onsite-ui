import type { LabeledValue } from "@/types/internal/infos";
import type { MetadataRecord } from "@/composables/collection_tools/getMetadataEntry";

const enum ArtShowTableApi {
  ast_old_1 = "artshow-table",
  ast_0p5 = "artshow-table-half",
  ast_1p0 = "artshow-table-one",
  ast_2p0 = "artshow-table-two",
  ast_3p0 = "artshow-table-three",
}

export const enum ArtShowTable {
  none = "",
  ast_0p5 = ArtShowTableApi.ast_0p5,
  ast_1p0 = ArtShowTableApi.ast_1p0,
  ast_2p0 = ArtShowTableApi.ast_2p0,
  ast_3p0 = ArtShowTableApi.ast_3p0,
}

export type ArtShowTableApiValue = `${ArtShowTableApi}`;
export type ArtShowTableValue = `${ArtShowTable}`;

export const metadataRecordForArtShowTables: MetadataRecord<
  LabeledValue<ArtShowTableValue>
> = {
  [ArtShowTable.none]: { label: "No Art Show Table" },
  [ArtShowTable.ast_0p5]: { label: "AS Table 0.5" },
  [ArtShowTable.ast_1p0]: { label: "AS Table 1" },
  [ArtShowTable.ast_2p0]: { label: "AS Table 2" },
  [ArtShowTable.ast_3p0]: { label: "AS Table 3" },
};
