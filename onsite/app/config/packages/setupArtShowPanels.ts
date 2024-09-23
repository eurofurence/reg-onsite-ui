import type { LabeledValue } from "@/types/internal";

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

const enum ArtShowPanel {
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

export const setupArtShowPanelsPlaceholder: LabeledValue<ArtShowPanelValue> = {
  value: ArtShowPanel.none,
  label: "No Art Show Panel",
};

export const setupArtShowPanels: LabeledValue<ArtShowPanelValue>[] = [
  setupArtShowPanelsPlaceholder,
  {
    value: ArtShowPanel.asp_0p5,
    label: "AS Panel 0.5",
  },
  {
    value: ArtShowPanel.asp_1p0,
    label: "AS Table 1.0",
  },
  {
    value: ArtShowPanel.asp_1p5,
    label: "AS Table 1.5",
  },
  {
    value: ArtShowPanel.asp_2p0,
    label: "AS Table 2.0",
  },
  {
    value: ArtShowPanel.asp_2p5,
    label: "AS Table 2.5",
  },
  {
    value: ArtShowPanel.asp_3p0,
    label: "AS Table 3.0",
  },
  {
    value: ArtShowPanel.asp_3p5,
    label: "AS Table 3.5",
  },
  {
    value: ArtShowPanel.asp_4p0,
    label: "AS Table 4.0",
  },
];
