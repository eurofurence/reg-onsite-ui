import type { LabeledValue } from "@/types/internal/infos";
import type { MetadataRecord } from "@/composables/collection_tools/getMetadataEntry";

const enum TicketType {
  early_bird = "early",
  late_bird = "late",
}

export type TicketTypeValue = `${TicketType}`;

export const metadataRecordForTicketType: MetadataRecord<
  LabeledValue<TicketTypeValue>
> = {
  [TicketType.early_bird]: { label: "Early Bird Ticket" },
  [TicketType.late_bird]: { label: "Late Bird Ticket" },
};
