import { ColorsPalette } from "@/config/theme";
import type { StatusInfo } from "@/types/internal";

export const enum Status {
  new = "new",
  approved = "approved",
  partially_paid = "partially paid",
  paid = "paid",
  checked_in = "checked in",
  cancelled = "cancelled",
  deleted = "deleted",
}

export type StatusValues = `${Status}`;

export const setupStatus: StatusInfo[] = [
  {
    value: Status.approved,
    label: "Approved",
    color: ColorsPalette.orange_400,
    icon: "pi pi-times",
  },
  {
    value: Status.partially_paid,
    label: "Partially paid",
    color: ColorsPalette.yellow_400,
    icon: "pi pi-exclamation-triangle",
  },
  {
    value: Status.paid,
    label: "Paid",
    color: ColorsPalette.green_400,
    icon: "pi pi-check",
  },
  {
    value: Status.checked_in,
    label: "Checked in",
    color: ColorsPalette.primary_600,
    icon: "pi pi-id-card",
  },
];
