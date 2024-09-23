import type { LabeledValue } from "@/types/internal";

const enum ArtShowTableApi {
  ast_old_1 = "artshow-table",
  ast_0p5 = "artshow-table-half",
  ast_1p0 = "artshow-table-one",
  ast_2p0 = "artshow-table-two",
  ast_3p0 = "artshow-table-three",
}

const enum ArtShowTable {
  none = "",
  ast_0p5 = ArtShowTableApi.ast_0p5,
  ast_1p0 = ArtShowTableApi.ast_1p0,
  ast_2p0 = ArtShowTableApi.ast_2p0,
  ast_3p0 = ArtShowTableApi.ast_3p0,
}

export type ArtShowTableApiValue = `${ArtShowTableApi}`;
export type ArtShowTableValue = `${ArtShowTable}`;

export const setupArtShowTablesPlaceholder: LabeledValue<ArtShowTableValue> = {
  value: ArtShowTable.none,
  label: "No Art Show Table",
};

export const setupArtShowTables: LabeledValue<ArtShowTableValue>[] = [
  setupArtShowTablesPlaceholder,
  {
    value: ArtShowTable.ast_0p5,
    label: "AS Table 0.5",
  },
  {
    value: ArtShowTable.ast_1p0,
    label: "AS Table 1",
  },
  {
    value: ArtShowTable.ast_2p0,
    label: "AS Table 2",
  },
  {
    value: ArtShowTable.ast_3p0,
    label: "AS Table 3",
  },
];
