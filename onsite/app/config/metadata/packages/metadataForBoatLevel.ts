import type { LabeledValue } from "@/types/internal/infos";
import type { MetadataRecord } from "@/composables/collection_tools/getMetadataEntry";

const enum BoatLevel {
  benefactor = "boat-benefactor",
  trip = "boat-trip",
  vip = "boat-vip",
}

export type BoatLevelValue = `${BoatLevel}`;

export const metadataRecordForBoatLevel: MetadataRecord<
  LabeledValue<BoatLevelValue>
> = {
  [BoatLevel.benefactor]: { label: "Boat Benefactor" },
  [BoatLevel.trip]: { label: "Boat Trip" },
  [BoatLevel.vip]: { label: "Boat VIP" },
};
