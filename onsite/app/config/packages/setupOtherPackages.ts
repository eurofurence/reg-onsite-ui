import type { LabeledValue } from "@/types/internal";

const enum BoatLevel {
  benefactor = "boat-benefactor",
  trip = "boat-trip",
  vip = "boat-vip",
}

export type BoatLevelValue = `${BoatLevel}`;

const enum Ticket {
  early_bird = "early",
  late_bird = "late",
}

export type TicketValue = `${Ticket}`;

export type OtherPackageApiValue = BoatLevelValue | TicketValue;

export const setupOtherPackages: LabeledValue<OtherPackageApiValue>[] = [
  {
    value: BoatLevel.benefactor,
    label: "Boat Benefactor",
  },
  {
    value: BoatLevel.trip,
    label: "Boat Trip",
  },
  {
    value: BoatLevel.vip,
    label: "Boat VIP",
  },
  {
    value: Ticket.early_bird,
    label: "Early Bird Ticket",
  },
  {
    value: Ticket.late_bird,
    label: "Late Bird Ticket",
  },
];
