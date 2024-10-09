import type { LabeledValue } from "@/types/internal/infos";
import type { MetadataRecord } from "@/composables/collection_tools/getMetadataEntry";
import { getMetadataList } from "@/composables/collection_tools/getMetadataList";

const enum ArtShowApiPanel {
  asp_old_1 = "artshow-panel",
  asp_0p5 = "artshow-panel-half",
  asp_1p0 = "artshow-panel-one",
  asp_1p5 = "artshow-panel-oneandhalf",
  asp_2p0 = "artshow-panel-two",
  asp_2p5 = "artshow-panel-twoandhalf",
  asp_3p0 = "artshow-panel-three",
  asp_3p5 = "artshow-panel-threeandhalf",
  asp_4p0 = "artshow-panel-four",
}

export const enum ArtShowPanel {
  none = "",
  asp_0p5 = ArtShowApiPanel.asp_0p5,
  asp_1p0 = ArtShowApiPanel.asp_1p0,
  asp_1p5 = ArtShowApiPanel.asp_1p5,
  asp_2p0 = ArtShowApiPanel.asp_2p0,
  asp_2p5 = ArtShowApiPanel.asp_2p5,
  asp_3p0 = ArtShowApiPanel.asp_3p0,
  asp_3p5 = ArtShowApiPanel.asp_3p5,
  asp_4p0 = ArtShowApiPanel.asp_4p0,
}

export type ArtShowPanelValue = `${ArtShowPanel}`;
export type ArtShowPanelApiValue = `${ArtShowApiPanel}`;

export const metadataRecordForArtShowPanels: MetadataRecord<
  LabeledValue<ArtShowPanelValue>
> = {
  [ArtShowPanel.none]: { label: "No Art Show Panel" },
  [ArtShowPanel.asp_0p5]: { label: "AS Panel 0.5" },
  [ArtShowPanel.asp_1p0]: { label: "AS Table 1.0" },
  [ArtShowPanel.asp_1p5]: { label: "AS Table 1.5" },
  [ArtShowPanel.asp_2p0]: { label: "AS Table 2.0" },
  [ArtShowPanel.asp_2p5]: { label: "AS Table 2.5" },
  [ArtShowPanel.asp_3p0]: { label: "AS Table 3.0" },
  [ArtShowPanel.asp_3p5]: { label: "AS Table 3.5" },
  [ArtShowPanel.asp_4p0]: { label: "AS Table 4.0" },
};

export const metadataListForArtShowPanels: LabeledValue<ArtShowPanelValue>[] =
  getMetadataList(metadataRecordForArtShowPanels);
